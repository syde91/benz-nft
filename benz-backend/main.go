package main

import (
	"log"

	"benz-backend/api"
	"benz-backend/db"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

const Port = ":8090"

func main() {
	defer db.DB.Close()

	// Create a new Gin router
	router := gin.Default()
	router.Use(cors.Default())
	config := cors.DefaultConfig()
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE"}
	config.AllowOrigins = []string{"http://localhost:3000"}

	router.Use(cors.New(config))
	// Define a route to handle HTTP GET requests
	router.POST("/generate-receipt", api.GenerateReceiptHandler)

	// Run the HTTP server
	if err := router.Run(Port); err != nil {
		log.Fatal(err)
	}
}
