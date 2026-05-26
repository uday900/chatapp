import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import api from "../api/axios";
import { API_ENDPOINTS } from "../utils/endpoints";
import { getProfileImage } from "../utils/constants";
import { showError, showSuccess } from "../utils/toast";
import { getMyChatsApi, setSelectedChat } from "../redux/slice/chat.slice";
import ModalShell from "./ModalShell";

export default function CreateGroupModal({ open, onClose, onGroupCreated }) {
  const dispatch = useDispatch();
  const searchInputRef = useRef(null);

  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [useContactNumber, setUseContactNumber] = useState(false);

  // Fetch contacts when searching
  useEffect(() => {
    const loadContacts = async () => {
      const query = searchQuery.trim();

      if (!query) {
        setContacts([]);
        return;
      }

      setContactsLoading(true);
      try {
        const params = { search: query };
        if (useContactNumber) {
          params.newChat = true;
        }

        const response = await api.get(API_ENDPOINTS.CONTACTS, {
          params,
        });
        // Filter out already selected members
        const availableContacts = (response.data?.data || []).filter(
          (contact) => !selectedMembers.some((m) => m.id === contact.id)
        );
        setContacts(availableContacts);
      } catch (error) {
        showError(
          error?.response?.data?.message ||
          "Unable to load contacts. Please try again."
        );
      } finally {
        setContactsLoading(false);
      }
    };

    const debounceTimer = setTimeout(loadContacts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedMembers]);

  const handleSelectContact = (contact) => {
    if (!selectedMembers.some((m) => m.id === contact.id)) {
      setSelectedMembers([...selectedMembers, contact]);
      setSearchQuery("");
      setContacts([]);
      searchInputRef.current?.focus();
    }
  };

  const handleRemoveMember = (memberId) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== memberId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      showError("Please enter a group name");
      return;
    }

    if (selectedMembers.length === 0) {
      showError("Please select at least one member");
      return;
    }

    setIsCreating(true);
    try {
      const memberIds = selectedMembers.map((m) => m.id);

      const response = await api.post(API_ENDPOINTS.CHAT_CREATE, {
        type: "GROUP",
        name: groupName.trim(),
        memberIds,
      });

      const newChat = response.data?.data?.chatDetails || response.data?.data;

      if (!newChat?.chatId) {
        showError("Unable to create group. Please try again.");
        return;
      }

      showSuccess("Group created successfully!");

      // Update chat list and select new chat
      dispatch(getMyChatsApi());
      dispatch(setSelectedChat(newChat));

      // Reset and close
      setGroupName("");
      setSelectedMembers([]);
      setSearchQuery("");
      setUseContactNumber(false);
      onGroupCreated?.();
    } catch (error) {
      console.error("Create group error:", error);
      showError(
        error?.response?.data?.message ||
        "Failed to create group. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Create Group">
      <div className="max-h-[60vh] overflow-y-auto">
        <div className="mb-6 flex items-start justify-between gap-4">

        </div>
        {/* Group Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group Name
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            maxLength={50}
            className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          />
          <p className="text-xs text-gray-500 mt-1">
            {groupName.length}/50
          </p>
        </div>

        {/* Group Profile Image - Auto-generated */}
        {groupName.trim() && (
          <div className="mb-6 flex flex-col items-center">
            <p className="text-sm font-medium text-gray-700 mb-3">Group Profile</p>
            <img
              src={getProfileImage(groupName, null)}
              alt={groupName}
              className="h-24 w-24 rounded-full object-cover shadow-md border-2 border-indigo-200"
            />
          </div>
        )}

        {/* Search Contacts */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Members
          </label>
          <div className="relative">
            <input
              ref={searchInputRef}
              type={useContactNumber ? "tel" : "text"}
              inputMode={useContactNumber ? "numeric" : "text"}
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(useContactNumber ? value.replace(/\D/g, "") : value);
              }}
              placeholder={useContactNumber ? "Enter contact number" : "Search contacts..."}
              className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />

            <button
              type="button"
              onClick={() => {
                setUseContactNumber((value) => !value);
                setSearchQuery("");
                setContacts([]);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-700 text-sm font-semibold transition"
              title={useContactNumber ? "Search contacts" : "Search by number"}
            >
              {useContactNumber ? "Contacts" : "Use number"}
            </button>
          </div>
        </div>

        {/* Contacts Dropdown */}
        {searchQuery && (
          <div className="mb-6 border border-gray-200 rounded-2xl bg-gray-50 max-h-40 overflow-y-auto">
            {contactsLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Loading contacts...
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No contacts found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => handleSelectContact(contact)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 transition flex items-center gap-3"
                  >
                    <img
                      src={getProfileImage(
                        contact.full_name,
                        contact.id
                      )}
                      alt={contact.full_name}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contact.full_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {contact.email || contact.mobile}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Members */}
        {selectedMembers.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Selected Members ({selectedMembers.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-2"
                >
                  <img
                    src={getProfileImage(member.full_name, member.id)}
                    alt={member.full_name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {member.full_name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    className="ml-1 text-indigo-600 hover:text-indigo-700 transition"
                    aria-label="Remove member"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end border-t border-gray-200 pt-6">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={isCreating || !groupName.trim() || selectedMembers.length === 0}
            className="px-6 py-2 rounded-full bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating && (
              <svg
                className="w-4 h-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isCreating ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
