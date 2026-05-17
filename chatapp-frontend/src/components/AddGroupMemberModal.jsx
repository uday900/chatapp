import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { API_ENDPOINTS } from "../utils/endpoints";
import { filterAvailableMembers } from "../utils/contact.util";
import ModalShell from "./ModalShell";
import { showError, showSuccess } from "../utils/toast";

export default function AddGroupMemberModal({
  chatId,
  open,
  onClose,
  onMembersAdded,
}) {
  const [availableMembers, setAvailableMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState(new Set());
  const [showNewContact, setShowNewContact] = useState(false);
  const [newContactMobile, setNewContactMobile] = useState("");
  const [newContactResult, setNewContactResult] = useState(null);
  const [newContactLoading, setNewContactLoading] = useState(false);
  const [addingMembers, setAddingMembers] = useState(false);

  const foundUserAlreadyInGroup = useMemo(() => {
    if (!newContactResult?.id) return false;
    return availableMembers.some(
      (member) => member.id === newContactResult.id && member.alreadyInGroup
    );
  }, [availableMembers, newContactResult]);

  const fetchAvailableMembers = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);
    try {
      const response = await api.get(API_ENDPOINTS.CHAT_AVAILABLE_MEMBERS(chatId));
      setAvailableMembers(response.data?.data || []);
    } catch (error) {
      showError(
        error?.response?.data?.message ||
          "Unable to fetch available members. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    if (open) {
      setSearchQuery("");
      setSelectedMemberIds(new Set());
      setShowNewContact(false);
      setNewContactResult(null);
      fetchAvailableMembers();
    }
  }, [open, fetchAvailableMembers]);

  const filteredMembers = useMemo(() => {
    return filterAvailableMembers(availableMembers, searchQuery);
  }, [availableMembers, searchQuery]);

  const toggleMemberSelection = (memberId) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  const addMembers = async (memberIds) => {
    if (!chatId || memberIds.length === 0) return;
    setAddingMembers(true);
    try {
      await api.post(API_ENDPOINTS.CHAT_ADD_MEMBERS(chatId), {
        targetUserIds: memberIds,
      });
      showSuccess("Members added to the group.");
      onMembersAdded?.();
      onClose();
    } catch (error) {
      showError(
        error?.response?.data?.message ||
          "Unable to add members. Please try again."
      );
    } finally {
      setAddingMembers(false);
    }
  };

  const handleAddSelected = async () => {
    await addMembers(Array.from(selectedMemberIds));
  };

  const searchUserByMobile = async () => {
    const mobile = newContactMobile.trim();
    if (!mobile) {
      showError("Please enter a mobile number.");
      return;
    }
    setNewContactLoading(true);
    setNewContactResult(null);
    try {
      const response = await api.get(API_ENDPOINTS.USER_BY_MOBILE(mobile));
      setNewContactResult(response.data?.data || null);
    } catch (error) {
      if (error?.response?.data?.errorCode === "RESOURCE_NOT_FOUND") {
        showError("User not found.");
      } else {
        showError(
          error?.response?.data?.message ||
            "Unable to lookup user. Please try again."
        );
      }
    } finally {
      setNewContactLoading(false);
    }
  };

  const handleAddFoundContact = async () => {
    if (!newContactResult?.id) return;
    if (foundUserAlreadyInGroup) {
      showError("This user is already in the group.");
      return;
    }
    await addMembers([newContactResult.id]);
  };

  const hasSelected = selectedMemberIds.size > 0;

  return (
    <ModalShell
      open={open}
      title="Add member"
      onClose={onClose}
      footer={
        !showNewContact && (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-500">{selectedMemberIds.size} selected</p>
            <button
              onClick={handleAddSelected}
              disabled={!hasSelected || addingMembers}
              className={`rounded-full px-5 py-3 text-sm font-semibold text-white ${
                !hasSelected || addingMembers
                  ? "bg-gray-300"
                  : "bg-black hover:bg-gray-900"
              }`}
            >
              {addingMembers ? "Adding..." : "Add selected"}
            </button>
          </div>
        )
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Search contacts and add them to this group.</p>

        {!showNewContact && (
          <>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or number"
                className="flex-1 rounded-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10"
              />
              <button
                onClick={() => {
                  setShowNewContact(true);
                  setNewContactResult(null);
                }}
                className="rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                + New contact
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto space-y-3">
              {loading ? (
                <div className="text-sm text-gray-500">Loading contacts...</div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-sm text-gray-500">No contacts found.</div>
              ) : (
                filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      if (!member.alreadyInGroup) {
                        toggleMemberSelection(member.id);
                      }
                    }}
                    className={`w-full rounded-3xl border px-4 py-3 text-left transition ${
                      member.alreadyInGroup
                        ? "border-gray-200 bg-gray-50"
                        : selectedMemberIds.has(member.id)
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-white hover:border-black/10 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{member.full_name}</p>
                        <p className="text-sm text-gray-500">{member.mobile}</p>
                      </div>
                      {member.alreadyInGroup ? (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                          Already added to the group
                        </span>
                      ) : (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 text-sm">
                          {selectedMemberIds.has(member.id) ? "✓" : "+"}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {showNewContact && (
          <div className="space-y-4 rounded-3xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">New contact</h3>
                <p className="text-sm text-gray-500">Enter mobile number to search the user.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowNewContact(false);
                  setNewContactMobile("");
                  setNewContactResult(null);
                }}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                Back
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={newContactMobile}
                onChange={(e) => setNewContactMobile(e.target.value)}
                placeholder="Mobile number"
                className="w-full rounded-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/10"
              />
              <button
                type="button"
                onClick={searchUserByMobile}
                disabled={newContactLoading}
                className={`w-full rounded-full px-4 py-3 text-sm font-medium text-white ${
                  newContactLoading ? "bg-gray-300" : "bg-black hover:bg-gray-900"
                }`}
              >
                {newContactLoading ? "Searching..." : "Search user"}
              </button>

              {newContactResult ? (
                <div className="rounded-3xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{newContactResult.full_name}</p>
                      <p className="text-sm text-gray-500">{newContactResult.mobile_number || newContactResult.mobile}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddFoundContact}
                      disabled={addingMembers || foundUserAlreadyInGroup}
                      className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${
                        foundUserAlreadyInGroup
                          ? "bg-gray-300"
                          : "bg-black hover:bg-gray-900"
                      }`}
                    >
                      {foundUserAlreadyInGroup ? "Already added" : "Add to group"}
                    </button>
                  </div>
                  {foundUserAlreadyInGroup ? (
                    <p className="mt-3 text-sm text-gray-500">This user is already in the group.</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}
