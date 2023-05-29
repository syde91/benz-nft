package api

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"benz-backend/db"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
)

const (
	UniqueViolationErr = pq.ErrorCode("23505")
)

type genertateReceiptRequest struct {
	NRIC     string `json:"nric"`
	WalletID string `json:"wallet_id"`
}

func getErrorMessage(err error) string {
	if pgerr, ok := err.(*pq.Error); ok {
		if pgerr.Code == UniqueViolationErr {
			if pgerr.Constraint == "users_pkey" {
				return "NRIC already exists"
			}
			if pgerr.Constraint == "receipts_pkey" {
				return "Wallet ID already exists"
			}
		}
	}
	return "Unexpected error occoured"
}

func GenerateReceiptHandler(c *gin.Context) {
	body, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Unable to read request body"})
		return
	}
	var req genertateReceiptRequest
	err = json.Unmarshal(body, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Received wrong request body"})
		return
	}

	hash := sha256.New()
	hash.Write([]byte(req.NRIC + ":" + req.WalletID))
	hashedBytes := hash.Sum(nil)
	// Convert the hashed bytes to a hexadecimal string
	hashedString := hex.EncodeToString(hashedBytes)
	query := `INSERT INTO "receipts" ("nric", "wallet_id", "receipt_id") VALUES ($1, $2, $3)`
	_, err = db.DB.ExecContext(context.Background(), query, req.NRIC, req.WalletID, hashedString)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": getErrorMessage(err), "error": err})
		return
	}

	// Return the data as JSON
	c.JSON(http.StatusOK, gin.H{"receipt": hashedString})
}
