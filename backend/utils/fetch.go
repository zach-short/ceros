package utils

import (
	"context"
	"os"
	"time"

	"github.com/zach-short/final-web-programming/config"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func FetchItem(query bson.M, collection string) (bson.M, error) {
	Collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection(collection)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	var item bson.M
	err := Collection.FindOne(ctx, query, options.FindOne()).Decode(&item)
	if err != nil {
		return nil, err
	}

	return item, nil
}

func FetchItems(query bson.M, collection string) ([]bson.M, error) {
	Collection := config.DB.Database(os.Getenv("DATABASE_NAME")).Collection(collection)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	cursor, err := Collection.Find(ctx, query, options.Find())
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []bson.M
	err = cursor.All(ctx, &items)
	if err != nil {
		return nil, err
	}

	return items, nil
}
