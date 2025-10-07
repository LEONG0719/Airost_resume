import axios from 'axios';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import UserAvatar from '../images/image.png';
import Transition from '../utils/Transition';

const keyStr = 'qE0S4wgKLC3RUP1dLXlkSGKj1xUeQYRG';

function DropdownProfile({ align }) {
   const containerRef = useRef<HTMLDivElement>(null)
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef(null);
  const dropdown = useRef(null);

  // ✅ Load user from cookies or fallback to defaults
  const [user, setUser] = useState({
    name: Cookies.get('user_name') || 'User',
    avatar: Cookies.get('user_avatar') || UserAvatar,
    role: 'User',
  });

  // Hide on / or /login
  if (location.pathname === '/' || location.pathname === '/login') return null;

  const handleSignOut = () => {
    Cookies.remove('token');
    Cookies.remove('role');
    Cookies.remove('fingerprints');
    Cookies.remove('device_fp');
    Cookies.remove('internalId');
    Cookies.remove('user_name');
    Cookies.remove('user_avatar');
    navigate('/login');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = Cookies.get('token');
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          Cookies.remove('token');
          Cookies.remove('role');
          navigate('/login');
          return;
        }
      } catch (err) {
        console.error('Invalid token', err);
        return;
      }

      try {
        const res = await axios.get('https://whohk.olgtx.dpdns.org/chengfeng-search?mod=1', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const bytes = CryptoJS.AES.decrypt(
          res.data.data,
          CryptoJS.enc.Utf8.parse(keyStr),
          {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
          }
        );
        const decrypted = CryptoJS.enc.Utf8.stringify(bytes);

        if (!decrypted || decrypted.trim() === '') {
          console.error('Decryption succeeded but content is empty or invalid.');
          return;
        }

        const parsed = JSON.parse(decrypted);
        const info = parsed.page?.result?.[0];
        if (!info) {
          console.error('User info not found in decrypted content:', parsed);
          return;
        }

        const isAdmin = info.groupList?.some(
          (g) => g.groupId === 'MEM_572173955719_5795'
        );

        const avatarUrl = info.showAvatarPath || info.avatarPath || UserAvatar;

        // ✅ Save to cookies
        Cookies.set('role', isAdmin ? 'admin' : 'user', { expires: 7 });
        Cookies.set('internalId', info.internalNum, { expires: 7 });
        Cookies.set('group', info.groupList[0].groupId, { expires: 7 });
        Cookies.set('user_name', info.name || 'User', { expires: 7 });
        Cookies.set('user_avatar', avatarUrl, { expires: 7 });

        // ✅ Set local state
        setUser({
          name: info.name || 'User',
          internalId: info.internalNum,
          avatar: avatarUrl,
          role: isAdmin ? 'Administrator' : 'User',
        });

      } catch (error) {
        console.error('Profile fetch or decryption failed:', error);
      }
    };

    fetchProfile();
  }, []);

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [dropdownOpen]);

  // close on ESC
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [dropdownOpen]);

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className="inline-flex justify-center items-center group"
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <img className="w-8 h-8 rounded-full" src={user.avatar || UserAvatar} width="32" height="32" alt="User" />
        <div className="flex items-center truncate">
          <span className="truncate ml-2 text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">{user.name}</span>
          <svg className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" viewBox="0 0 12 12">
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </button>

      <Transition
        className={`origin-top-right z-10 absolute top-full min-w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60">
            <div className="font-medium text-gray-800 dark:text-gray-100">{user.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">{user.internalId}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">{user.role}</div>
          </div>
          <ul>
            <li>
              <Link
                className="font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-1 px-3"
                to="/dashboard"
                onClick={() => setDropdownOpen(false)}
              >
                Settings
              </Link>
            </li>
            <li>
              <button
                className="font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-1 px-3 w-full text-left"
                onClick={() => { setDropdownOpen(false); handleSignOut(); }}
              >
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  );
}

export default DropdownProfile;
