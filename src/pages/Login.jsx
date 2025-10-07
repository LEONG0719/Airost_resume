import axios from 'axios';
import CryptoJS from 'crypto-js';
import Fingerprint2 from 'fingerprintjs2';
import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../images/image.png'; // adjust path if needed
import Header from '../partials/Header';

function Login({ setToken = () => {} }) {
  const [Email, setEmail] = useState('');
  const [popup, setPopup] = useState({ show: false, message: '', type: '' });
  const [password, setPassword] = useState('');
  const [aes_key, setAes_key] = useState('');
  const [isFaceLogin, setIsFaceLogin] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    UserID: '',
    register_code: '',
    Email: '',
    MatricNo: '',
    name: '',
    Phone: '',
    photo: '',
  });
  const [status, setStatus] = useState('');
  const [streaming, setStreaming] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    Fingerprint2.get((components) => {
      const fp = Fingerprint2.x64hash128(components.map(c => c.value).join(''));
      const stored = Cookies.get('fingerprints');
      const list = stored ? stored.split(',') : [];
      if (!list.includes(fp)) {
        if (list.length >= 2) {
          alert('Maximum number of devices reached');
        } else {
          Cookies.set('fingerprints', [...list, fp].join(','), { expires: 365 });
        }
      }
      Cookies.set('device_fp', fp, { expires: 365 });
    });
  }, []);

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      (error) => {
        console.error('Location error:', error);
      }
    );
  };

  const fetchSecurityCode = async () => {
    try {
      const res = await axios.get(`https:/text.olgtx.com/security-code?code=${formData.register_code}`);
      setAes_key(res.data.aes_key);
    } catch {
      alert('Error fetching security code');
    }
  };

 const encryptPassword = (pw, aes_key) => {
  const key = CryptoJS.enc.Utf8.parse(aes_key.substring(0, 32));
  const iv = CryptoJS.enc.Utf8.parse(aes_key.substring(16, 32)); // must be 16 bytes

  return CryptoJS.AES.encrypt(pw, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString();
};


  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
      setStreaming(true);
      setTimeout(stopStreaming, 10000);
    }).catch((err) => {
      console.error('Camera error:', err);
      setStatus('Camera access failed');
    });
  };

  const stopStreaming = () => {
    const vid = videoRef.current;
    if (vid && vid.srcObject) {
      vid.srcObject.getTracks().forEach((t) => t.stop());
    }
    setStreaming(false);
  };

  const capturePhoto = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    const image = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
    setImageSrc(image);
    setFormData({ ...formData, photo: image });
    stopStreaming();
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    fetchSecurityCode();
    getLocation();
    const encryptedPassword = encryptPassword(password);
    const timestamp = Date.now();
    try {
      await axios.post('https://text.olgtx.com/register', {
        UserID: formData.UserID,
        register_code: formData.register_code,
        MetricNo: formData.MatricNo,
        Email: formData.Email,
        Name: formData.name,
        Phone: formData.Phone,
        Password: encryptedPassword,
        Photo: formData.photo,
      });

      await axios.post('https://text.olgtx.com/register-record', {
        UserID: formData.UserID,
        register_code: formData.register_code,
        latitude,
        longitude,
        timestamp,
      });

      alert('User registered successfully');
      setIsRegister(false);
      stopStreaming();
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      alert('Error registering user');
    }
  };

  const setProfileFromServer = async (token) => {
    const keyStr = 'qE0S4wgKLC3RUP1dLXlkSGKj1xUeQYRG';
    try {
      const res = await axios.get('https://whohk.olgtx.dpdns.org/chengfeng-search?mod=1', {
        headers: { Authorization: `Bearer ${token}` },
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
      Cookies.set('user_name', info.name || 'User', { expires: 7 });
      Cookies.set('user_avatar', avatarUrl, { expires: 7 });

    } catch (error) {
      console.error('Profile fetch or decryption failed:', error);
    }
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const keyRes = await axios.post("https://text.olgtx.com/fetch-aes-key", { Email });
    const aes_key = keyRes.data.aes_key;

    const encryptedPassword = encryptPassword(password, aes_key);
    setAes_key(aes_key);

    const loginRes = await axios.post("https://text.olgtx.com/login", {
      Email,
      encryptedPassword,
    });

    if (loginRes.data.success === true) {
      setPopup({ show: true, message: "✅ Login successful!", type: "success" });

      Cookies.set('token', loginRes.data.token, { expires: 7 });
      await setProfileFromServer(loginRes.data.token);
      const role = Cookies.get('role') || 'user';
      setToken(loginRes.data.token);
      setTimeout(() => {
        setPopup({ show: false, message: '', type: '' });
        navigate(role === 'admin' ? '/admin' : '/user');
      }, 1500);
    } else {
      setPopup({ show: true, message: "❌ Invalid username or password", type: "error" });
      setTimeout(() => setPopup({ show: false, message: '', type: '' }), 2500);
    }
  } catch (err) {
    console.error("Login error:", err);
    setPopup({ show: true, message: "🚨 password error. Please try again.", type: "error" });
    setTimeout(() => setPopup({ show: false, message: '', type: '' }), 2500);
  }
};



  const sendPhotoToBackend = async () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    const photo = canvasRef.current.toDataURL('image/jpeg').split(',')[1];

    try {
      setStatus('Verifying face...');
      const res = await axios.post('https://text.olgtx.com/api/verify-face', { photo });
      if (res.data.success === true) {
        Cookies.set('token', res.data.token, { expires: 7 });
        await setProfileFromServer(res.data.token);
        const role = Cookies.get('role') || 'user';
        setToken(res.data.token);
        navigate(role === 'admin' ? '/admin' : '/user');
      } else {
        alert('Face verification failed');
      }
    } catch (err) {
      console.error('Face login error:', err);
      setStatus('Face verification failed');
    }
  };

  return (
    
    <div className="min-h-screen flex flex-col">
      <Header sidebarOpen={false} setSidebarOpen={() => {}} variant="v2" />
      {popup.show && (
  <div className={`fixed top-5 right-5 z-50 p-4 rounded shadow-lg transition-all
    ${popup.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
    {popup.message}
  </div>
)}

      <div className="flex flex-col grow items-center justify-center px-6 py-12">
        <img src="https://cdn.cookielaw.org/logos/9375bad7-f65e-4f8a-bc16-8254723bd66a/10736aa6-11a1-40d7-b1de-de46f2e1acf2/DHL_logo_rgb.png" alt="DHL" className="h-15 object-contain" />
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-amber-100">
          {isRegister ? 'Register Your Account' : isFaceLogin ? 'Face Login' : 'Sign in to your account'}
        </h2>
        <div className="w-full max-w-sm glass">
          {isRegister ? (
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="flex flex-col items-center">
                
                <video ref={videoRef} className="border rounded-md" autoPlay playsInline />
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex flex-col items-center">
                {!streaming ? (
                  <button type="button" onClick={startCamera} className="btn-primary w-full">
                    Allow Camera
                  </button>
                ) : (
                  <button type="button" onClick={capturePhoto} className="btn-primary w-full">
                    Capture Photo
                  </button>
                )}
              </div>
              <input
                type="text"
                name="UserID"
                placeholder="UserID"
                required
                onChange={(e) => setFormData({ ...formData, UserID: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                name="MatricNo"
                placeholder="Matric No"
                required
                onChange={(e) => setFormData({ ...formData, MatricNo: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                name="name"
                placeholder="Name"
                required
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="email"
                name="Email"
                placeholder="Email"
                required
                onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                name="Phone"
                placeholder="Phone"
                required
                 maxLength={9} // Limit to 9 characters
                ononChange={(e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 9); // Keep only first 9 digits
    setFormData({ ...formData, Phone: digitsOnly });
  }}
                className="w-full border p-2 rounded"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                name="register_code"
                placeholder="register_code"
                required
                onChange={(e) => setFormData({ ...formData, register_code: e.target.value })}
                className="w-full border p-2 rounded"
              />
              <button type="submit" className="btn-primary w-full">
                Register
              </button>
            </form>
          ) : isFaceLogin ? (
            <div className="space-y-4">
              <video ref={videoRef} autoPlay playsInline width="400" height="240" />
              <canvas ref={canvasRef} className="hidden" width="400" height="240" />
              {!streaming ? (
                <button onClick={startCamera} className="btn-primary w-full">Allow Camera</button>
              ) : (
                <button onClick={sendPhotoToBackend} className="btn-primary w-full">Start Face Recognition Login</button>
              )}
              {status && <p className="text-center text-gray-600">{status}</p>}
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleLogin}>
              <input type="email" value={Email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full border p-2 rounded" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full border p-2 rounded" />
              <button type="submit" className="btn-primary w-full">Sign in</button>
            </form>
          )}
          <div className="mt-6 text-center space-y-2">
            {!isRegister && (
              <button onClick={() => setIsFaceLogin(!isFaceLogin)} className="text-sm text-violet-600 hover:underline">
                {isFaceLogin ? 'Switch to Email Login' : 'Switch to Face Recognition Login'}
              </button>
            )}
            <div>
              <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-violet-600 hover:underline">
                {isRegister ? 'Back to login' : 'Sign up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
