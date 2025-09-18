package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Address struct {
	Street string `bson:"street,omitempty" json:"street,omitempty"`
	City   string `bson:"city,omitempty" json:"city,omitempty"`
	State  string `bson:"state,omitempty" json:"state,omitempty"`
	Zip    string `bson:"zip,omitempty" json:"zip,omitempty"`
}

type PrivacySettings struct {
	ShowEmail       bool `bson:"showEmail" json:"showEmail"`
	ShowPhoneNumber bool `bson:"showPhoneNumber" json:"showPhoneNumber"`
	ShowAddress     bool `bson:"showAddress" json:"showAddress"`
	ShowGivenName   bool `bson:"showGivenName" json:"showGivenName"`
	ShowFamilyName  bool `bson:"showFamilyName" json:"showFamilyName"`
	ShowBio         bool `bson:"showBio" json:"showBio"`
	ShowPicture     bool `bson:"showPicture" json:"showPicture"`
}

type NotificationSettings struct {
	EmailNotifications         bool `bson:"emailNotifications" json:"emailNotifications"`
	CommitteeInvitations       bool `bson:"committeeInvitations" json:"committeeInvitations"`
	MotionNotifications        bool `bson:"motionNotifications" json:"motionNotifications"`
	VoteNotifications          bool `bson:"voteNotifications" json:"voteNotifications"`
	FriendRequestNotifications bool `bson:"friendRequestNotifications" json:"friendRequestNotifications"`
}

type UserSettings struct {
	Theme                       string               `bson:"theme" json:"theme"` // "light", "dark", "system"
	AutoAcceptFriendInvitations bool                 `bson:"autoAcceptFriendInvitations" json:"autoAcceptFriendInvitations"`
	Privacy                     PrivacySettings      `bson:"privacy" json:"privacy"`
	Notifications               NotificationSettings `bson:"notifications" json:"notifications"`
}

type User struct {
	ID           primitive.ObjectID `bson:"_id" json:"id"`
	Email        string             `bson:"email" json:"email"`
	Name         string             `bson:"name,omitempty" json:"name,omitempty"`
	GivenName    string             `bson:"givenName,omitempty" json:"givenName,omitempty"`
	FamilyName   string             `bson:"familyName,omitempty" json:"familyName,omitempty"`
	PasswordHash string             `bson:"passwordHash,omitempty" json:"passwordHash,omitempty"`
	Bio          string             `bson:"bio,omitempty" json:"bio,omitempty"`
	Picture      string             `bson:"picture,omitempty" json:"picture,omitempty"`
	PhoneNumber  string             `bson:"phoneNumber,omitempty" json:"phoneNumber,omitempty"`
	Address      Address            `bson:"address,omitempty" json:"address,omitempty"`
	Settings     UserSettings       `bson:"settings,omitempty" json:"settings,omitempty"`
}

func GetDefaultUserSettings() UserSettings {
	return UserSettings{
		Theme:                       "system",
		AutoAcceptFriendInvitations: false,
		Privacy: PrivacySettings{
			ShowEmail:       false,
			ShowPhoneNumber: false,
			ShowAddress:     false,
			ShowGivenName:   true,
			ShowFamilyName:  true,
			ShowBio:         true,
			ShowPicture:     true,
		},
		Notifications: NotificationSettings{
			EmailNotifications:         true,
			CommitteeInvitations:       true,
			MotionNotifications:        true,
			VoteNotifications:          true,
			FriendRequestNotifications: true,
		},
	}
}
