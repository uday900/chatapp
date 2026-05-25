import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from "react-icons/io5";
import api from '../api/axios';
import { API_ENDPOINTS, REACT_ENDPOINTS } from '../utils/endpoints';
import { showError } from '../utils/toast';
import { logout } from '../redux/slice/authSlice';
import { formatLastSeen } from '../utils/date.util';
import { getProfileImage } from '../utils/constants';
import { FaUserEdit } from 'react-icons/fa';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [fullName, setFullName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleUpdateName = async () => {
    try {
      setSavingName(true);

      await api.patch(API_ENDPOINTS.UPDATE_USER, {
        full_name: fullName,
      });

      setUserDetails((prev) => ({
        ...prev,
        full_name: fullName,
      }));
      setIsEditingName(false);
    } catch (error) {
      showError(
        error?.response?.data?.message ||
        'Failed to update name'
      );
    } finally {
      setSavingName(false);
    }
  };
  // const handleUpdateEmail = async () => {
  //   try {
  //     setSavingEmail(true);

  //     await api.patch(API_ENDPOINTS.UPDATE_EMAIL, {
  //       email,
  //     });

  //     setUserDetails((prev) => ({
  //       ...prev,
  //       email,
  //     }));
  //   } catch (error) {
  //     showError(
  //       error?.response?.data?.message ||
  //       'Failed to update email'
  //     );
  //   } finally {
  //     setSavingEmail(false);
  //   }
  // };
  // const handleUpdateMobile = async () => {
  //   try {
  //     setSavingMobile(true);

  //     await api.patch(API_ENDPOINTS.UPDATE_MOBILE, {
  //       mobile_number: mobile,
  //     });

  //     setUserDetails((prev) => ({
  //       ...prev,
  //       mobile,
  //     }));
  //   } catch (error) {
  //     showError(
  //       error?.response?.data?.message ||
  //       'Failed to update mobile'
  //     );
  //   } finally {
  //     setSavingMobile(false);
  //   }
  // };
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
        const user = response.data?.data;

        setFullName(user?.full_name || '');
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
      <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-start gap-4">


        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-11 h-11 rounded-full cursor-pointer text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-black active:scale-95"
        >
          <IoArrowBack className="text-[24px]" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account details and logout.</p>
        </div>

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
                  <div className="flex items-center gap-2 flex-wrap">
  {isEditingName ? (
    <>
      <input
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="border border-gray-300 rounded-xl px-3 py-1.5 text-lg font-semibold outline-none focus:border-blue-500"
      />

      <button
        onClick={() => handleUpdateName()}
        disabled={
          savingName ||
          !fullName.trim() ||
          fullName === userDetails?.full_name
        }
        className={`px-4 py-1.5 rounded-xl text-sm font-medium text-white transition cursor-pointer ${savingName
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
          }`}
      >
        {savingName ? 'Saving...' : 'Save'}
      </button>

      <button
        onClick={() => {
          setIsEditingName(false);
          setFullName(userDetails?.full_name || '');
        }}
        className="px-4 py-1.5 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
      >
        Cancel
      </button>
    </>
  ) : (
    <>
      <h2 className="text-2xl font-semibold text-gray-900">
        {userDetails?.full_name}
      </h2>

      <FaUserEdit
        onClick={() => setIsEditingName(true)}
        className="cursor-pointer text-gray-500 hover:text-blue-500"
      />
    </>
  )}
</div>
                  <p className="text-sm text-gray-500">{userDetails?.email}</p>
                  <p className="text-sm text-gray-500">{userDetails?.mobile}</p>
                </div>
                <div className="flex-1 space-y-5">
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
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition-all duration-200 active:scale-95 ${loggingOut
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 cursor-pointer shadow-sm hover:shadow-md"
                  }`}
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
