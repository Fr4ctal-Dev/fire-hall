# fire-hall
A school project to learn JS middleware

## Running the code (server-side)

### Dependancies

Using a dependancy manager like `npm`install the following packages:
* `dotenv`
* `express`
* `bcrypt`
* `express-flash`
* `express-session`
* `method-override`
* `passport-local`

* `nodemon`

### Nodemon

Starting the server can be done by running `nodemon server.js`.

The server will start on port 3000.

## Code documentation

### Auth
Authentication is done with passport.js. Users are saved on the `Users` table on the database with username, email and password fields.

Password encryption is provided with `bcrypt` which hashes the password and salts it.

### Database
The database consists of 4 Tables (+1 for Auth data). The ER Model and database dump file can be found in the `database` directory.

### View Pages
The view pages query the database on load, the EJS template receives the data in a JSON object which is passed to the Datatable builder.

### Edit Pages
Edit Pages have both `HTTP GET` and `HTTP POST` handlers. 

#### Get
On `GET` the edit page pulls data for select box options and serves the form.

#### Post
On `POST` the server inserts posted data to the database.

