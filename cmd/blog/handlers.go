package main

import (
	"database/sql"
	"encoding/json"
	"html/template"
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
)

type createPostRequest struct {
	Title       string `json:"title"`
	Subtitle    string `json:"subtitle"`
	ImgModifier string `json:"image_url"`
	Autor       string `json:"author"`
	AutorImg    string `json:"author_url"`
	PublishDate string `json:"publish_date"`
	Content     string `json:"content"`
}

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

func createPost(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		reqData, err := io.ReadAll(r.Body) // Прочитали тело запроса с reqData в виде массива байт
		if err != nil {
			http.Error(w, "1Error", 500)
			log.Println(err.Error())
			return
		}

		var req createPostRequest // Заранее объявили переменную  createOrderRequest

		err = json.Unmarshal(reqData, &req) // Отдали reqData и req на парсинг библиотеке json
		if err != nil {
			http.Error(w, "2Error", 500)
			log.Println(err.Error())
			return
		}

	}

}

// func createPost(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		reqData, err := io.ReadAll(r.Body)
// 		if err != nil {
// 			http.Error(w, "1Error", 500)
// 			log.Println(err.Error())
// 			return
// 		}

// 		var req createPostRequest

// 		authorImg, err := base64.StdEncoding.DecodeString(req.AuthorPhoto)
// 		if err != nil {
// 			http.Error(w, "img", 500)
// 			log.Println(err.Error())
// 			return
// 		}

// 		fileAuthor, err := os.Create("static/images/" + req.AuthorPhotoName)

// 		_, err = fileAuthor.Write(authorImg)

// 		bigImg, err := base64.StdEncoding.DecodeString(req.BigImage)
// 		if err != nil {
// 			http.Error(w, "img", 500)
// 			log.Println(err.Error())
// 			return
// 		}

// 		fileBig, err := os.Create("static/images/" + req.BigImageName)

// 		_, err = fileBig.Write(bigImg)

// 		smallImg, err := base64.StdEncoding.DecodeString(req.AuthorPhoto)
// 		if err != nil {
// 			http.Error(w, "img", 500)
// 			log.Println(err.Error())
// 			return
// 		}

// 		fileSmall, err := os.Create("static/images/" + req.AuthorPhotoName)

// 		_, err = fileSmall.Write(smallImg)

// 		err = json.Unmarshal(reqData, &req)
// 		if err != nil {
// 			http.Error(w, "2Error", 500)
// 			log.Println(err.Error())
// 			return
// 		}

// 		err = saveOrder(db, req)
// 		if err != nil {
// 			http.Error(w, "bd", 500)
// 			log.Println(err.Error())
// 			return
// 		}
// 		return
// 	}
// }

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
			featured
		) 
		VALUES 
		(
			?,
			?,
			?,
			?,
			?,
			?,
			0
		);
	`

	_, err := db.Exec(query, req.Title, req.Subtitle, req.ImgModifier, req.Autor, req.AutorImg, req.PublishDate, req.Content) // Сами данные передаются через аргументы к ф-ии Exec
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

	// for _, post := range posts {
	// 	post.PostUrl = "/post/" + post.PostId // Формируем исходя из ID ордера в базе
	// }

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
