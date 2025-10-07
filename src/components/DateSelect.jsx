import { startOfToday, subDays, subMonths, subYears } from 'date-fns';
import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from 'react';
import Transition from '../utils/Transition';

function DateSelect() {
  const options = [
    {
      id: 0,
      period: 'Today',
      getRange: () => {
        const today = startOfToday();
        return [today, today];
      }
    },
    {
      id: 1,
      period: 'Last 7 Days',
      getRange: () => {
        const end = startOfToday();
        const start = subDays(end, 6);
        return [start, end];
      }
    },
    {
      id: 2,
      period: 'Last Month',
      getRange: () => {
        const end = startOfToday();
        const start = subMonths(end, 1);
        return [start, end];
      }
    },
    {
      id: 3,
      period: 'Last 12 Months',
      getRange: () => {
        const end = startOfToday();
        const start = subYears(end, 1);
        return [start, end];
      }
    },
    {
      id: 4,
      period: 'All Time',
      getRange: () => {
        const start = new Date(2000, 0, 1);
        const end = startOfToday();
        return [start, end];
      }
    },
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selected, setSelected] = useState(2); // Default to "Last Month"

  const trigger = useRef(null);
  const dropdown = useRef(null);

  // ✅ Load selection from cookies
  useEffect(() => {
    const savedId = Cookies.get('date_range_id');
    if (savedId !== undefined) {
      const id = parseInt(savedId);
      if (!isNaN(id) && id >= 0 && id < options.length) {
        setSelected(id);
      }
    }
  }, []);

  // ✅ Handle selection + cookie writing
  const handleSelection = (id) => {
    setSelected(id);
    setDropdownOpen(false);

    Cookies.set('date_range_id', id, { expires: 1 });

    const [start, end] = options[id].getRange();
    Cookies.set('date_range_start', start.toISOString(), { expires: 1 });
    Cookies.set('date_range_end', end.toISOString(), { expires: 1 });

    console.log(`Selected: ${options[id].period}`);
    console.log('Start:', start.toISOString());
    console.log('End:', end.toISOString());
  };

  // 🧼 Close on outside click
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current || !dropdownOpen) return;
      if (!dropdown.current.contains(target) && !trigger.current.contains(target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [dropdownOpen]);

  // 🧼 Close on ESC
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (keyCode === 27) setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [dropdownOpen]);

  return (
    <div className="relative">
      <button
        ref={trigger}
        className="btn justify-between min-w-44 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <span className="flex items-center">
          <svg className="fill-current text-gray-400 dark:text-gray-500 shrink-0 mr-2" width="16" height="16" viewBox="0 0 16 16">
            <path d="M5 4a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H5Z" />
            <path d="M4 0a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4H4ZM2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z" />
          </svg>
          <span>{options[selected].period}</span>
        </span>
        <svg className="shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500" width="11" height="7" viewBox="0 0 11 7">
          <path d="M5.4 6.8L0 1.4 1.4 0l4 4 4-4 1.4 1.4z" />
        </svg>
      </button>

      <Transition
        show={dropdownOpen}
        tag="div"
        className="z-10 absolute top-full right-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1"
        enter="transition ease-out duration-100 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-100"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div
          ref={dropdown}
          className="font-medium text-sm text-gray-600 dark:text-gray-300"
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          {options.map((option) => (
            <button
              key={option.id}
              tabIndex="0"
              className={`flex items-center w-full hover:bg-gray-50 dark:hover:bg-gray-700/20 py-1 px-3 cursor-pointer ${
                option.id === selected ? 'text-violet-500' : ''
              }`}
              onClick={() => handleSelection(option.id)}
            >
              <svg
                className={`shrink-0 mr-2 fill-current text-violet-500 ${
                  option.id !== selected ? 'invisible' : ''
                }`}
                width="12"
                height="9"
                viewBox="0 0 12 9"
              >
                <path d="M10.28.28L3.989 6.575 1.695 4.28A1 1 0 00.28 5.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28.28z" />
              </svg>
              <span>{option.period}</span>
            </button>
          ))}
        </div>
      </Transition>
    </div>
  );
}

export default DateSelect;
