package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/zach-short/final-web-programming/handlers"
	"github.com/zach-short/final-web-programming/middleware"
)

func SetupRoutes(r *gin.Engine) {
	auth := r.Group("/auth")
	{
		auth.POST("/login", handlers.Login)
		auth.POST("/register", handlers.Register)
		auth.POST("/social", handlers.SocialAuth)
		auth.POST("/check-email", handlers.CheckEmail)
	}

	users := r.Group("/users")
	users.Use(middleware.AuthMiddleware())
	{
		users.GET("/search", handlers.SearchUsers)
		users.GET("/check-username", handlers.CheckUsername)
		users.GET("/:userID/profile", handlers.GetPublicProfile)

		me := users.Group("/me")
		{
			me.GET("", handlers.GetMe)
			me.PATCH("", handlers.UpdateProfile)
			me.PATCH("/settings", handlers.UpdateUserSettings)

			friends := me.Group("/friends")
			{
				friends.GET("", handlers.GetFriendships)
				friends.GET("/pending", handlers.GetPendingRequests)
				friends.GET("/sent", handlers.GetSentRequests)
				friends.POST("/request", handlers.RequestFriend)
				friends.POST("/block", handlers.BlockUser)

				friend := friends.Group("/:friendshipId")
				{
					friend.GET("", handlers.GetFriendship)
					friend.POST("/accept", handlers.AddFriend)
					friend.POST("/reject", handlers.RejectFriend)
					friend.DELETE("/unblock", handlers.UnblockUser)
					friend.DELETE("", handlers.RemoveFriend)
				}
			}

			notifications := me.Group("/notifications")
			{
				notifications.GET("", handlers.GetNotifications)
				notifications.PATCH("/mark-all-read", handlers.MarkAllNotificationsRead)
				notifications.POST("", handlers.CreateNotification)

				notification := notifications.Group("/:notificationId")
				{
					notification.PATCH("/read", handlers.MarkNotificationRead)
					notification.DELETE("", handlers.DismissNotification)
				}
			}

			comittees := me.Group("/comittees")
			{
				comittee := comittees.Group("/:comitteeId")
				{
					motions := comittee.Group("/motions")
					{
						motion := motions.Group("/:motionId")
						{
							motion.GET("", handlers.GetMotion)
						}
					}
				}
			}
		}
	}

	ws := r.Group("/ws")
	{
		ws.GET("/chat", handlers.HandleWebSocket)
	}

	chat := r.Group("/chat")
	chat.Use(middleware.AuthMiddleware())
	{
		chat.POST("/dm/start", handlers.StartDMConversation)
		chat.GET("/dm/:recipientId/history", handlers.GetDMHistory)
		chat.GET("/conversations", handlers.GetUserConversations)
	}

	committees := r.Group("/committees")
	committees.Use(middleware.AuthMiddleware())
	{
		committee := committees.Group("/:id")
		{
			committee.POST("/chat/start", handlers.StartCommitteeChat)
			committee.GET("/chat/history", handlers.GetCommitteeHistory)
		}
	}

	messages := r.Group("/messages")
	messages.Use(middleware.AuthMiddleware())
	{
		messages.GET("/:id/replies", handlers.GetMessageReplies)
		messages.POST("/:id/reaction", handlers.ToggleMessageReaction)
	}
}
