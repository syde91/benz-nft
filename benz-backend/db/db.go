package db

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

var (
	Host     string = os.Getenv("DB_HOST")
	Port     string = os.Getenv("DB_PORT")
	Username string = os.Getenv("DB_USERNAME")
	Password string = os.Getenv("DB_PASSWORD")
	DBName   string = "nric-db"
)

func init() {
	var err error
	DB, err = sql.Open("postgres", "host="+Host+" port="+Port+" user="+Username+" password="+Password+" dbname="+DBName+" sslmode=disable")
	if err != nil {
		log.Fatal(err)
	}
}
