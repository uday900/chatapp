import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { API_ENDPOINTS, REACT_ENDPOINTS } from '../utils/endpoints';
import { showError } from '../utils/toast';
import { logout } from '../redux/slice/authSlice';
import { formatLastSeen } from '../utils/date.util';
import { getProfileImage } from '../utils/constants';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (!authUser?.id) {
        navigate(REACT_ENDPOINTS.LOGIN);
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(API_ENDPOINTS.USER_DETAILS(authUser.id));
        setUserDetails(response.data?.data || null);
      } catch (error) {
        showError(
          error?.response?.data?.message ||
            'Unable to fetch user details. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [authUser?.id, dispatch, navigate]);

  const handleLogout = async () => {
    if (!window.confirm('Are you sure do you want to logout?')) {
      return;
    }

    setLoggingOut(true);
    try {
      await api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.warn('Logout failed', error);
    }

    dispatch(logout());
    setLoggingOut(false);
    navigate(REACT_ENDPOINTS.LOGIN);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account details and logout.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        {loading ? (
          <div className="rounded-3xl bg-white p-6 text-center text-gray-500 shadow-sm">
            Loading user details...
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <img
                  src={userDetails?.profile_picture || getProfileImage(userDetails?.full_name, userDetails?.id)}
                  alt={userDetails?.full_name || 'User'}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{userDetails?.full_name}</h2>
                  <p className="text-sm text-gray-500">{userDetails?.email}</p>
                  <p className="text-sm text-gray-500">{userDetails?.mobile}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">User ID</p>
                  <p className="mt-2 text-sm text-gray-900">{userDetails?.id}</p>
                </div>
                <div className="rounded-3xl bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Last seen</p>
                  <p className="mt-2 text-sm text-gray-900">{formatLastSeen(userDetails?.last_seen)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-red-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Logout</h2>
              <p className="text-sm text-gray-500 mb-4">
                Sign out of your account and return to the login page.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white ${loggingOut ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
