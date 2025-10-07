import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import GenderSelect from '../components/GenderSelect';
import GroupSelect from '../components/GroupSelect';
import Pagination from '../components/Pagination';
import { backUpTranslations, nameTranslations } from '../lib/name';
import Header from '../partials/Header';
import Sidebar from '../partials/Sidebar';
function SearchPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [groupValue, setGroupValue] = useState('');
  const [gender, setGender] = useState('');
  const [groupOptions, setGroupOptions] = useState([]);
  const [results, setResults] = useState([]);
  const [results1, setResults1] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isFaceSearch, setIsFaceSearch] = useState(false);

  const defaultVisibleColumns = {
    avatar: true,
    name: true,
    sex: true,
    internal_num: true,
    class: true,
    backup: true,
    similarity: false,
  };
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);

  const getTokenFromCookie = () => {
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    return match ? match[2] : null;
  };

  useEffect(() => {
    const fetchGroups = async () => {
      const token = getTokenFromCookie();
      try {
        const res = await axios.get('https://who2.olgtx.dpdns.org/api/groups', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const transformed = [{ id: '', name: 'All Groups' }].concat(
          (res.data || []).map(g => ({
            id: g.group_name,
            name: g.group_name
          }))
        );
        setGroupOptions(transformed);
      } catch (err) {
        console.error('Failed to fetch groups:', err);
      }
    };
    fetchGroups();
  }, []);

  const handleSearch = async (page = 1) => {
    const token = getTokenFromCookie();
    try {
      const res = await axios.post('https://who2.olgtx.dpdns.org/api/search', {
        keyword, groupValue, gender, pageNo: page, pageSize
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res.data?.page?.result || []);
      setResults1([]);
      setTotalCount(res.data?.page?.totalCount || 0);
      setPageNo(page);
      setIsFaceSearch(false);
      setVisibleColumns(prev => ({ ...prev, similarity: false }));
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleUpload = async () => {
    const token = getTokenFromCookie();
    if (!imageFile) return;

    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const recogRes = await axios.post('https://face.olgtx.com/api/v1/recognition/recognize', formData, {
        headers: {
          'x-api-key': '8ee8f925-3806-4219-aa22-f59597562b4e',
          'Content-Type': 'multipart/form-data'
        }
      });

      const subjects = recogRes.data?.result?.flatMap(f => f.subjects.map(s => s.subject)) || [];
      if (subjects.length === 0) {
        setResults([]);
        setTotalCount(0);
        setIsFaceSearch(true);
        setVisibleColumns(prev => ({ ...prev, similarity: false }));
        return;
      }

      setResults1(recogRes.data?.result || []);
      setVisibleColumns(prev => ({ ...prev, similarity: true }));
      setIsFaceSearch(true);

      const backendRes = await axios.post('https://who2.olgtx.dpdns.org/api/recognize', { subjects }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResults(backendRes.data?.page?.result || []);
      setTotalCount(backendRes.data?.page?.totalCount || 0);
      setPageNo(1);
    } catch (err) {
      console.error('Face recognition error:', err.response?.data || err.message);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex h-screen overflow-hidden text-gray-800 dark:text-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="p-4 sm:p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="Name or ID"
                className="w-full rounded-md border dark:bg-blue-950 dark:text-amber-50 border-gray-300 bg-white py-2 pl-3 pr-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <GroupSelect groupValue={groupValue} setGroupValue={setGroupValue} groupOptions={groupOptions} />
              <GenderSelect genderValue={gender} setGenderValue={setGender} />
              <button className="w-full py-2 px-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => handleSearch(1)}>Search</button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files[0])}
                className="w-full sm:w-auto rounded-md border dark:bg-blue-950 dark:text-amber-50 border-gray-300 bg-white py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                className="w-full sm:w-auto py-2 px-3 rounded-md bg-amber-600 text-white hover:bg-amber-700"
                onClick={handleUpload}
              >
                Face Search
              </button>
            </div>
          </motion.div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold mb-3">Visible Columns</h3>
            <div className="flex flex-wrap gap-4 text-sm">
              {Object.keys(defaultVisibleColumns).map(col => (
                <label key={col} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    className="form-checkbox text-blue-600 dark:text-blue-400"
                    checked={visibleColumns[col]}
                    onChange={() =>
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [col]: !prev[col],
                      }))
                    }
                  />
                  {col}
                </label>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {results.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border">
                <table className="min-w-full text-sm table-auto text-center">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      {visibleColumns.avatar && <th className="px-4 py-3">Avatar</th>}
                      {visibleColumns.name && <th className="px-4 py-3">Name</th>}
                      {visibleColumns.sex && <th className="px-4 py-3">Gender</th>}
                      {visibleColumns.internal_num && <th className="px-4 py-3">ID</th>}
                      {visibleColumns.class && <th className="px-4 py-3">Class</th>}
                      {visibleColumns.backup && <th className="px-4 py-3">Background</th>}
                      {visibleColumns.similarity && <th className="px-4 py-3">Similarity</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, idx) => {
                      const faceMatch = results1.find(f => f.subjects.some(s => s.subject === r.member_id));
                      const similarity = faceMatch ? faceMatch.subjects.find(s => s.subject === r.member_id)?.similarity : null;

                      return (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          {visibleColumns.avatar && (
                            <td className="px-4 py-3">
                              <img src={r.avatar_path} alt="avatar" className="w-10 h-10 rounded-full mx-auto object-cover" />
                            </td>
                          )}
                          {visibleColumns.name && (
  <td className="px-4 py-3">
    {nameTranslations[r.name] || r.name}
  </td>
)}

                          {visibleColumns.sex && (
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${r.sex === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>{r.sex}</span>
                            </td>
                          )}
                          {visibleColumns.internal_num && <td className="px-4 py-3">{r.internal_num}</td>}
                          {visibleColumns.class && <td className="px-4 py-3">{r.groupList?.[0]?.groupName || ''}</td>}
                          {visibleColumns.backup && (<td className="px-4 py-3">{backUpTranslations[r.backup] || '-'}</td>)}
                          {visibleColumns.similarity && (
                            <td className="px-4 py-3">
                              {similarity !== null ? (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${similarity > 0.8 ? 'bg-green-500' : similarity > 0.5 ? 'bg-yellow-500' : 'bg-red-400'}`}
                                    style={{ width: `${(similarity * 100).toFixed(1)}%` }}
                                  />
                                </div>
                              ) : '-'}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <Pagination pageNo={pageNo} pageSize={pageSize} totalCount={totalCount} onPageChange={handleSearch} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default SearchPage;
