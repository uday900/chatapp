import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchGroupDetails } from '../redux/slice/user.slice';
import { getProfileImage } from '../utils/constants';
import { API_ENDPOINTS } from '../utils/endpoints';
import api from '../api/axios';
import { showError, showSuccess } from '../utils/toast';

export default function GroupDetailsPage() {
  const { chatId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { groupDetails, loading, error } = useSelector((state) => state.userchat);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (chatId) {
      dispatch(fetchGroupDetails(chatId));
    }
  }, [chatId, dispatch]);

  const currentUserMember = groupDetails?.allMembers?.find(
    (member) => member.user?.id === currentUser?.id
  );
  const currentUserIsAdmin = currentUserMember?.role === 'ADMIN';

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      await api.delete(API_ENDPOINTS.CHAT_MEMBER(chatId, memberId));
      showSuccess('Member removed from group.');
      dispatch(fetchGroupDetails(chatId));
    } catch (error) {
      showError(
        error?.response?.data?.message ||
          'Unable to remove member. Please try again.'
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-gray-500">Loading group details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!groupDetails) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-gray-500">No group details found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-5 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Group Details</h1>
      </div>

      {/* Group Info */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={groupDetails.profile_picture_url || getProfileImage(groupDetails.name, groupDetails.id)}
              alt={groupDetails.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{groupDetails.name}</h2>
              <p className="text-sm text-gray-500">
                Created {new Date(groupDetails.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p><strong>Type:</strong> {groupDetails.type}</p>
            <p><strong>Members:</strong> {groupDetails.allMembers.length}</p>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Members</h3>
          <div className="space-y-4">
            {groupDetails.allMembers.map((member) => {
              const isCurrentUser = member.user?.id === currentUser?.id;

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50"
                >
                  <img
                    src={member.user.profile_picture || getProfileImage(member.user.full_name, member.user.id)}
                    alt={member.user.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{member.user.full_name}</p>
                      {isCurrentUser ? (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          You
                        </span>
                      ) : member.role === 'ADMIN' ? (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Admin
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-500">{member.user.mobile || member.user.mobile_number}</p>
                    <p className="text-xs text-gray-400">
                      Joined {new Date(member.joined_at || member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {!isCurrentUser && currentUserIsAdmin ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.user.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      <span>Remove</span>
                      <span aria-hidden="true">✕</span>
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}