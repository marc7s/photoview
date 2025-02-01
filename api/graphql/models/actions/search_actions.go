package actions

import (
	"os"
	"strings"
	"time"

	"github.com/photoview/photoview/api/database/drivers"
	"github.com/photoview/photoview/api/graphql/models"
	"github.com/pkg/errors"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func Search(db *gorm.DB, query string, userID int, limitMedia *int, limitAlbums *int) (*models.SearchResult, error) {
	limitMediaInternal := 10
	limitAlbumsInternal := 10

	if limitMedia != nil {
		limitMediaInternal = *limitMedia
	}

	if limitAlbums != nil {
		limitAlbumsInternal = *limitAlbums
	}

	wildQuery := "%" + strings.ToLower(query) + "%"

	var media []*models.Media

	userSubquery := db.Table("user_albums").Where("user_id = ?", userID)
	if drivers.POSTGRES.MatchDatabase(db) {
		userSubquery = userSubquery.Where("album_id = \"Album\".id")
	} else {
		userSubquery = userSubquery.Where("album_id = Album.id")
	}

	err := db.Joins("Album").
		Where("EXISTS (?)", userSubquery).
		Where("LOWER(media.title) LIKE ? OR LOWER(media.path) LIKE ?", wildQuery, wildQuery).
		Clauses(clause.OrderBy{
			Expression: clause.Expr{
				SQL:                "(CASE WHEN LOWER(media.title) LIKE ? THEN 2 WHEN LOWER(media.path) LIKE ? THEN 1 END) DESC",
				Vars:               []interface{}{wildQuery, wildQuery},
				WithoutParentheses: true},
		}).
		Limit(limitMediaInternal).Find(&media).Error

	if err != nil {
		return nil, errors.Wrapf(err, "searching media")
	}

	var albums []*models.Album

	err = db.
		Where("EXISTS (?)", db.Table("user_albums").Where("user_id = ?", userID).Where("album_id = albums.id")).
		Where("albums.title LIKE ? OR albums.path LIKE ?", wildQuery, wildQuery).
		Clauses(clause.OrderBy{
			Expression: clause.Expr{
				SQL:                "(CASE WHEN albums.title LIKE ? THEN 2 WHEN albums.path LIKE ? THEN 1 END) DESC",
				Vars:               []interface{}{wildQuery, wildQuery},
				WithoutParentheses: true},
		}).
		Limit(limitAlbumsInternal).
		Find(&albums).Error

	if err != nil {
		return nil, errors.Wrapf(err, "searching albums")
	}

	result := models.SearchResult{
		Query:  query,
		Media:  media,
		Albums: albums,
	}

	return &result, nil
}

func prt(msg string) {
	f, err := os.OpenFile("/app/log.txt", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		panic(err) // i'm simplifying it here. you can do whatever you want.
	}
	defer f.Close()
	f.WriteString(msg + "\r\n")
}

func AdvancedSearch(db *gorm.DB, fileNames []*string, albumIDs []*int, startDate *time.Time, endDate *time.Time, userID int, limitMedia *int) (*models.AdvancedSearchResult, error) {
	limitMediaInternal := 50

	if limitMedia != nil {
		limitMediaInternal = *limitMedia
	}

	prt(*fileNames[0])
	//prt(strconv.Itoa(*albumIDs[0]))
	prt(startDate.String())
	prt(endDate.String())
	prt("")

	fileNamesQuery := ""

	for i, fileName := range fileNames {
		if i > 0 {
			fileNamesQuery += " OR "
		}
		fileNamesQuery += "LOWER(media.title) LIKE '%" + strings.ToLower(*fileName) + "%'"
	}

	prt(fileNamesQuery)

	var media []*models.Media

	// Get the user albums to only search media the user has access to
	userSubquery := db.Table("user_albums").Where("user_id = ?", userID)
	if drivers.POSTGRES.MatchDatabase(db) {
		userSubquery = userSubquery.Where("album_id = \"Album\".id")
	} else {
		userSubquery = userSubquery.Where("album_id = Album.id")
	}

	// Get media matching search criteria
	err := db.Joins("Album").
		Where("EXISTS (?)", userSubquery). // Only get albums the user has access to
		//Where("album_id IN (?)", *albumID).                // Filter albums
		Where(fileNamesQuery). // Filter file names
		Limit(limitMediaInternal).Find(&media).Error

	if err != nil {
		return nil, errors.Wrapf(err, "searching media")
	}

	result := models.AdvancedSearchResult{
		Media: media,
	}

	return &result, nil
}
