package com.darlachat.repository;

import com.darlachat.enums.ChatRoomType;
import org.springframework.data.jpa.repository.JpaRepository;

import com.darlachat.entity.ChatRoom;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatRepository extends JpaRepository<ChatRoom, Long> {


    @Query("SELECT DISTINCT c FROM ChatRoom c JOIN c.chatRoomMembers m WHERE m.user.id = :userId")
    List<ChatRoom> findChatsByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM ChatRoom c WHERE c.chatName = :groupName")
    List<ChatRoom> findChatsByGroupName(@Param("groupName") String groupName);

    @Query("""
    SELECT c\s
    FROM ChatRoom c\s
    JOIN c.chatRoomMembers m\s
    WHERE m.user.id = :userId
    AND c.chatRoomType = :chatRoomType
    AND SIZE(c.chatRoomMembers) = 2
""")
    List<ChatRoom> findOneToOneChatsByUserIdAndType(
            @Param("userId") Long userId,
            @Param("chatRoomType") ChatRoomType chatRoomType);

    // repo call to find if individual chat room already exists between two users
    @Query("""
    SELECT c\s
    FROM ChatRoom c\s
    JOIN c.chatRoomMembers m1\s
    JOIN c.chatRoomMembers m2\s
    WHERE c.chatRoomType = 'INDIVIDUAL'\s
    AND m1.user.id = :userId1\s
    AND m2.user.id = :userId2\s
""")    ChatRoom findIndividualChatRoomBetweenUsers(
            @Param("userId1") Long userId1,
            @Param("userId2") Long userId2);



}
