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

		me := users.Group("/me")
		{
			me.GET("", handlers.GetMe)
			me.PATCH("", handlers.UpdateProfile)

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
}
