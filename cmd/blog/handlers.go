package main

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
)

const (
	authCookieName = "auth"
)

type createPostRequest struct {
	Title           string `json:"postTitle"`
	Subtitle        string `json:"postShortDescr"`
	ImgModifier     string `json:"image_url"`
	Autor           string `json:"postAuthorName"`
	AutorImg        string `json:"author_url"`
	PublishDate     string `json:"postPublishDate"`
	Content         string `json:"postContent"`
	BigImageName    string `json:"postBigImageName"`
	SmallImageName  string `json:"postSmallImageName"`
	AuthorPhotoName string `json:"postAdminPhotoName"`
	BigImage        string `json:"postBigImage"`
	SmallImage      string `json:"postSmallImage"`
	AuthorPhoto     string `json:"postAdminPhoto"`
}

type userData struct {
	UserId   string `db:"user_id"`
	Email    string `json:"loginEmail"`
	Password string `json:"loginPassword"`
}

// {"postTitle":"asd","postShortDescr":"asd","postAuthorName":"asd","postAdminPhoto":{},"postPublishDate":"2023-05-18","postBigImage":{"imageInBase64":"","nameFile":"0jmigrLMi0o.jpg"},"postContent":"asd"}

type indexPageData struct {
	Title           string
	Subtitle        string
	FeaturedPosts   []featuredPostData
	MostRecentPosts []mostRecentPostData
}

type adminLoginPageData struct {
	Title string
}

type adminPostPageData struct {
	Title string
}

type postPage struct {
	Title       string `db:"title"`
	PostId      string `db:"post_id"`
	Subtitle    string `db:"subtitle"`
	ImgModifier string `db:"image_url"`
	Autor       string `db:"author"`
	AutorImg    string `db:"author_url"`
	PublishDate string `db:"publish_date"`
	Content     string `db:"content"`
}

type featuredPostData struct {
	Title       string `db:"title"`
	PostId      string `db:"post_id"`
	Subtitle    string `db:"subtitle"`
	ImgModifier string `db:"image_url"`
	Autor       string `db:"author"`
	AutorImg    string `db:"author_url"`
	PublishDate string `db:"publish_date"`
	Content     string `db:"content"`
}

type mostRecentPostData struct {
	Title       string `db:"title"`
	PostId      string `db:"post_id"`
	Subtitle    string `db:"subtitle"`
	ImgModifier string `db:"image_url"`
	Autor       string `db:"author"`
	AutorImg    string `db:"author_url"`
	PublishDate string `db:"publish_date"`
	Content     string `db:"content"`
}

func index(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		featuredPosts, err := featuredPosts(db)
		if err != nil {
			http.Error(w, "Internal Server Error", 500) // В случае ошибки парсинга - возвращаем 500
			log.Println(err)
			return // Не забываем завершить выполнение ф-ии
		}

		mostRecentPosts, err := mostRecentPosts(db)
		if err != nil {
			http.Error(w, "Internal Server Error", 500) // В случае ошибки парсинга - возвращаем 500
			log.Println(err)
			return // Не забываем завершить выполнение ф-ии
		}

		ts, err := template.ParseFiles("pages/index.html") // Главная страница блога
		if err != nil {
			http.Error(w, "Internal Server Error", 500) // В случае ошибки парсинга - возвращаем 500
			log.Println(err)
			return // Не забываем завершить выполнение ф-ии
		}

		data := indexPageData{
			Title:           "Escape.",
			Subtitle:        "My best blog for adventures and burgers",
			FeaturedPosts:   featuredPosts,
			MostRecentPosts: mostRecentPosts,
		}

		err = ts.Execute(w, data) // Заставляем шаблонизатор вывести шаблон в тело ответа
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		log.Println("Request completed successfully")
	}
}

func authUser(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {

		reqData, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "error", 500)
			log.Println(err.Error())
			return
		}

		var req userData
		err = json.Unmarshal(reqData, &req)
		if err != nil {
			http.Error(w, "Enter password and email", 500)
			log.Println(err.Error())
			return
		}

		userData, err := getUserId(db, req.Email, req.Password)
		if err != nil {
			if err == sql.ErrNoRows {
				// sql.ErrNoRows возвращается, когда в запросе к базе не было ничего найдено
				// В таком случае мы возвращем 404 (not found) и пишем в тело, что ордер не найден
				http.Error(w, "Incorrect password or email", 401)
				log.Println(err.Error())
				http.SetCookie(w, &http.Cookie{
					Name:    "auth", // Устанавливаем имя куки, которую нужно удалить
					Path:    "/",
					Expires: time.Now().AddDate(0, 0, -1), // Выставляем дату протухания в “прошлом”
				})
				return
			}

			http.Error(w, "Internal server error", 500)
			log.Println(err.Error())
			return
		}

		// http.Redirect(w, r, "/admin-login", http.StatusSeeOther)
		// http.Error(w, "redirect", 500)
		// log.Println(err.Error())

		http.SetCookie(w, &http.Cookie{
			Name:    authCookieName,              // Устанавливаем имя куки
			Value:   fmt.Sprint(userData.UserId), // Конвертируем userID из user из типа int в string
			Path:    "/",                         // Говорим куке действовать по всем путям сайта
			Expires: time.Now().AddDate(0, 0, 1), // говорим куке протухнуть через день
		})

		w.WriteHeader(200)

		log.Println("Request completed successfully")

	}
}

func getUserId(db *sqlx.DB, email string, password string) (userData, error) {
	const query = `
		SELECT
			user_id
		FROM
			` + "`user`" +
		`WHERE
			email = ? AND
			password = ?
	`
	// SELECT user_id FROM `user` WHERE email = ?, password = ?
	// В SQL-запросе добавились параметры, как в шаблоне. ? означает параметр, который мы передаем в запрос ниже

	var user userData

	// Обязательно нужно передать в параметрах orderID
	err := db.Get(&user, query, email, password)
	if err != nil {
		return userData{}, err
	}

	return user, nil
}

func adminLogin(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {

		ts, err := template.ParseFiles("pages/admin-login.html") // Главная страница блога
		if err != nil {
			http.Error(w, "Internal Server Error", 500) // В случае ошибки парсинга - возвращаем 500
			log.Println(err)
			return // Не забываем завершить выполнение ф-ии
		}

		data := adminLoginPageData{
			Title: "Admin Login",
		}

		err = ts.Execute(w, data) // Заставляем шаблонизатор вывести шаблон в тело ответа
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		log.Println("Request completed successfully")
	}
}

func adminPost(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		err := authByCookie(db, w, r)
		if err != nil {
			return
		}

		ts, err := template.ParseFiles("pages/admin-post.html") // Главная страница блога
		if err != nil {
			http.Error(w, "Internal Server Error", 500) // В случае ошибки парсинга - возвращаем 500
			log.Println(err)
			return // Не забываем завершить выполнение ф-ии
		}

		data := adminPostPageData{
			Title: "Admin Post",
		}

		err = ts.Execute(w, data) // Заставляем шаблонизатор вывести шаблон в тело ответа
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		log.Println("Request completed successfully")
	}
}

func authByCookie(db *sqlx.DB, w http.ResponseWriter, r *http.Request) error {
	// Получаем куку или реагируем на её отсутствие
	cookie, err := r.Cookie(authCookieName)
	if err != nil {
		if err == http.ErrNoCookie {
			http.Error(w, "No auth cookie passed", 401)
			log.Println(err)
			return err
		}
		http.Error(w, "Internal Server Error", 500)
		log.Println(err)
		return err
	}

	//Достаём userIDStr из куки
	userIDStr := cookie.Value

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		http.Error(w, "Invalid user id", 403)
		log.Println(err)
		return err
	}

	// Поиск пользователя в бд. Если пользователь найден, то завершаем ф-ию

	_, err = userByID(db, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", 403)
			return err
		}
		http.Error(w, "Internal servev error", 500)
		log.Println(err)
		return err
	}
	return nil
}

func userByID(db *sqlx.DB, userID int) (userData, error) {
	const query = `
		SELECT
			user_id,
			email
		FROM
			` + "`user`" +
		`WHERE
			user_id = ?
	`

	var user userData

	// Обязательно нужно передать в параметрах orderID
	err := db.Get(&user, query, userID)
	if err != nil {
		return userData{}, err
	}

	return user, nil
}

func logout() func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		http.SetCookie(w, &http.Cookie{
			Name:    authCookieName, // Устанавливаем имя куки, которую нужно удалить
			Path:    "/",
			Expires: time.Now().AddDate(0, 0, -1), // Выставляем дату протухания в “прошлом”
		})

		log.Println("Request complete successfully")
	}
}

func createPost(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		reqData, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "error", 500)
			log.Println(err.Error())
			return
		}

		var req createPostRequest
		err = json.Unmarshal(reqData, &req)
		if err != nil {
			http.Error(w, "Please, download all images", 500)
			log.Println(err.Error())
			return
		}

		authorImg, err := base64.StdEncoding.DecodeString(req.AuthorPhoto[strings.IndexByte(req.AuthorPhoto, ',')+1:])
		if err != nil {
			http.Error(w, "Please, download author image", 500)
			log.Println(err.Error())
			return
		}

		fileAuthor, err := os.Create("static/img/post_autor/" + req.AuthorPhotoName)
		if err != nil {
			http.Error(w, "Error, download to server", 500)
			log.Println(err.Error())
			return
		}
		defer fileAuthor.Close()

		_, err = fileAuthor.Write(authorImg)
		if err != nil {
			http.Error(w, "Error, download to server", 500)
			log.Println(err.Error())
			return
		}

		bigImg, err := base64.StdEncoding.DecodeString(req.BigImage[strings.IndexByte(req.BigImage, ',')+1:])
		if err != nil {
			http.Error(w, "Please, download article preview", 500)
			log.Println(err.Error())
			return
		}

		fileBig, err := os.Create("static/img/post_photo/" + req.BigImageName)
		if err != nil {
			http.Error(w, err.Error(), 500)
			log.Println(err.Error())
			return
		}
		defer fileBig.Close()

		_, err = fileBig.Write(bigImg)
		if err != nil {
			http.Error(w, "error", 500)
			log.Println(err.Error())
			return
		}

		smallImg, err := base64.StdEncoding.DecodeString(req.SmallImage[strings.IndexByte(req.SmallImage, ',')+1:])
		if err != nil {
			http.Error(w, "error", 500)
			log.Println(err.Error())
			return
		}

		fileSmall, err := os.Create("static/img/post_photo/" + req.SmallImageName)
		if err != nil {
			http.Error(w, "error", 500)
			log.Println(err.Error())
			return
		}
		defer fileSmall.Close()

		_, err = fileSmall.Write(smallImg)
		if err != nil {
			http.Error(w, "error", 500)
			log.Println(err.Error())
			return
		}

		err = savePost(db, req)
		if err != nil {
			http.Error(w, "bd", 500)
			log.Println(err.Error())
			return
		}
	}
}

func savePost(db *sqlx.DB, req createPostRequest) error {
	const query = `
		INSERT INTO
			post
		(
			title,
			subtitle,
			author,
			author_url,
			publish_date,
			image_url,
			content
		)
		VALUES
		(
			?,
			?,
			?,
			CONCAT('/static/img/post_autor/', ?),
			?,
			CONCAT('/static/img/post_photo/', ?),
			?
		)
	`

	_, err := db.Exec(query, req.Title, req.Subtitle, req.Autor, req.AuthorPhotoName, req.PublishDate, req.BigImageName, req.Content)
	// _, err := db.Exec(query, req.Title, req.Subtitle, req.Autor, req.PublishDate, req.Content)
	return err
}

func post(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		postIDStr := mux.Vars(r)["postID"] // Получаем orderID в виде строки из параметров урла

		postID, err := strconv.Atoi(postIDStr) // Конвертируем строку orderID в число
		if err != nil {
			http.Error(w, "Invalid post id", 403)
			log.Println(err)
			return
		}

		post, err := postByID(db, postID)
		if err != nil {
			if err == sql.ErrNoRows {
				// sql.ErrNoRows возвращается, когда в запросе к базе не было ничего найдено
				// В таком случае мы возвращем 404 (not found) и пишем в тело, что ордер не найден
				http.Error(w, "post not found", 404)
				http.Error(w, "post not found", postID)
				log.Println(err)
				return
			}

			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		ts, err := template.ParseFiles("pages/post.html")
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		err = ts.Execute(w, post)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		log.Println("Request completed successfully")
	}
}

func postByID(db *sqlx.DB, postID int) (postPage, error) {
	const query = `
		SELECT
			title,
			subtitle,
			content,
			image_url
		FROM
			` + "`post`" +
		`WHERE
			post_id = ?
	`
	// В SQL-запросе добавились параметры, как в шаблоне. ? означает параметр, который мы передаем в запрос ниже

	var order postPage

	// Обязательно нужно передать в параметрах orderID
	err := db.Get(&order, query, postID)
	if err != nil {
		return postPage{}, err
	}

	return order, nil
}

func featuredPosts(db *sqlx.DB) ([]featuredPostData, error) {
	const query = `
		SELECT
		title,
		post_id, 
		subtitle, 
		author, 
		author_url, 
		publish_date, 
		image_url,
		content
		FROM
			post
		WHERE featured = 1
	` // Составляем SQL-запрос для получения записей для секции featured-posts

	var posts []featuredPostData // Заранее объявляем массив с результирующей информацией

	err := db.Select(&posts, query) // Делаем запрос в базу данных
	if err != nil {                 // Проверяем, что запрос в базу данных не завершился с ошибкой
		return nil, err
	}

	return posts, nil
}

func mostRecentPosts(db *sqlx.DB) ([]mostRecentPostData, error) {
	const query = `
		SELECT
		title, 
		subtitle,
		post_id, 
		author, 
		author_url, 
		publish_date, 
		image_url
		FROM
			post
		WHERE featured = 0
	` // Составляем SQL-запрос для получения записей для секции featured-posts

	var posts []mostRecentPostData // Заранее объявляем массив с результирующей информацией

	err := db.Select(&posts, query) // Делаем запрос в базу данных
	if err != nil {                 // Проверяем, что запрос в базу данных не завершился с ошибкой
		return nil, err
	}

	return posts, nil
}
