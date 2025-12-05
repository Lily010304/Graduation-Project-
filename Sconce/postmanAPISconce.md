Sconce.PL
RegisterStudent
POST
/api/Student/Account/RegisterStudent
//api/Student/Account/RegisterStudent
HEADERS
Content-Type
application/json

Accept
text/plain

Body
raw (json)
json
{
  "email": "mawoy17858@bialode.com",
  "fullName": "Mao Woy",
  "password": "Maowoy@123"
}
Example Request
OK
curl
curl --location '//api/Student/Account/RegisterStudent' \
--header 'Content-Type: application/json' \
--header 'Accept: text/plain' \
--data '{
  "email": "string",
  "fullName": "string",
  "password": "string"
}'
200 OK
Example Response
Body
Headers (1)
json
{}


GET
/api/Student/Account/ApproveParentLink
//api/Student/Account/ApproveParentLink?token=string
HEADERS
Accept
text/plain

PARAMS
token
string

Example Request
OK
curl
curl --location '//api/Student/Account/ApproveParentLink?token=string' \
--header 'Accept: text/plain'
200 OK
Example Response
Body
Headers (1)
json
{}


POST
/api/Student/Application/Apply
//api/Student/Application/Apply
HEADERS
Content-Type
multipart/form-data

Accept
text/plain

Body
formdata
City
Tulkarm

Country
Palestine

DateOfBirth
2001-01-06

Document
Email
mawoy17858@bialode.com

Gender
2

PhoneNumber
05987654321

Street
string

GuardianName
Afnan Abo-Asal

GuardianEmail
afnan.aboasal0@gmail.com

LevelOfProficiency
2

Example Request
OK
View More
curl
curl --location '//api/Student/Application/Apply' \
--header 'Content-Type: multipart/form-data' \
--header 'Accept: text/plain' \
--form 'City="string"' \
--form 'Country="string"' \
--form 'DateOfBirth="1955-01-06"' \
--form 'Document=@"/path/to/file"' \
--form 'Email="string"' \
--form 'Gender="2"' \
--form 'PhoneNumber="string"' \
--form 'Street="string"' \
--form 'GuardianName="string"' \
--form 'GuardianEmail="string"' \
--form 'LevelOfProficiency="2"'
200 OK
Example Response
Body
Headers (1)
json
{}

Status
GET
/api/Student/Application/Status
//api/Student/Application/Status?email=mawoy17858@bialode.com
HEADERS
Accept
text/plain

PARAMS
email
mawoy17858@bialode.com

Example Request
OK
curl
curl --location '//api/Student/Application/Status?email=string' \
--header 'Accept: text/plain'
200 OK
Example Response
Body
Headers (1)
json
{}


POST
/api/Parent/Account/RegisterParent
//api/Parent/Account/RegisterParent
HEADERS
Content-Type
application/json

Accept
text/plain

Body
raw (json)
json
{
  "dateOfBirth": "1964-10-18",
  "email": "zRNZh3@IOfOUQUoGOPXiHGIeTfqhCjGVFfC.ld",
  "fullName": "string",
  "gender": 0,
  "password": "string",
  "relationshipWithStudent": "string",
  "studentEmail": "LAsR6XKSScooM8T@WdZUTzSjzYiSxqvXGnw.tu"
}
Example Request
OK
View More
curl
curl --location '//api/Parent/Account/RegisterParent' \
--header 'Content-Type: application/json' \
--header 'Accept: text/plain' \
--data-raw '{
  "dateOfBirth": "1964-10-18",
  "email": "zRNZh3@IOfOUQUoGOPXiHGIeTfqhCjGVFfC.ld",
  "fullName": "string",
  "gender": 0,
  "password": "string",
  "relationshipWithStudent": "string",
  "studentEmail": "LAsR6XKSScooM8T@WdZUTzSjzYiSxqvXGnw.tu"
}'
200 OK
Example Response
Body
Headers (1)
json
{}


POST
/api/Parent/Account/RegisterParentWithInvite
//api/Parent/Account/RegisterParentWithInvite
HEADERS
Content-Type
application/json

Accept
text/plain

Body
raw (json)
json
{
  "dateOfBirth": "1949-03-08",
  "fullName": "string",
  "gender": 0,
  "password": "stringstring",
  "relationshipWithStudent": "string",
  "token": "string"
}
Example Request
OK
curl
curl --location '//api/Parent/Account/RegisterParentWithInvite' \
--header 'Content-Type: application/json' \
--header 'Accept: text/plain' \
--data '{
  "dateOfBirth": "1949-03-08",
  "fullName": "string",
  "gender": 0,
  "password": "stringstring",
  "relationshipWithStudent": "string",
  "token": "string"
}'
200 OK
Example Response
Body
Headers (1)
json
{}


POST
/api/Identity/Account/Login
//api/Identity/Account/Login
HEADERS
Content-Type
application/json

Accept
text/plain

Body
raw (json)
json
{
  "email": "anas.melhem@gmail.com",
  "password": "P@ssw0rd!"
}
Example Request
OK
curl
curl --location '//api/Identity/Account/Login' \
--header 'Content-Type: application/json' \
--header 'Accept: text/plain' \
--data '{
  "email": "string",
  "password": "string"
}'
200 OK
Example Response
Body
Headers (1)
json
{}


GET
/api/Identity/Account/ConfirmEmail
//api/Identity/Account/ConfirmEmail?token=string&userID=string
HEADERS
Accept
text/plain

PARAMS
token
string

userID
string

Example Request
OK
curl
curl --location '//api/Identity/Account/ConfirmEmail?token=string&userID=string' \
--header 'Accept: text/plain'
200 OK
Example Response
Body
Headers (1)
json
{}


POST
/api/Identity/Account/ForgotPassword
//api/Identity/Account/ForgotPassword
HEADERS
Content-Type
application/json

Accept
text/plain

Body
raw (json)
json
{
  "email": "mawoy17858@bialode.com"
}
Example Request
OK
curl
curl --location '//api/Identity/Account/ForgotPassword' \
--header 'Content-Type: application/json' \
--header 'Accept: text/plain' \
--data '{
  "email": "string"
}'
200 OK
Example Response
Body
Headers (1)
json
{}


PATCH
/api/Identity/Account/ResetPassword
//api/Identity/Account/ResetPassword
HEADERS
Content-Type
application/json

Accept
text/plain

Body
raw (json)
json
{
  "email": "string",
  "newPassword": "string",
  "code": "string"
}
Example Request
OK
curl
curl --location --request PATCH '//api/Identity/Account/ResetPassword' \
--header 'Content-Type: application/json' \
--header 'Accept: text/plain' \
--data '{
  "email": "string",
  "newPassword": "string",
  "code": "string"
}'
200 OK
Example Response
Body
Headers (1)
json
{}


Apply
GET
/api/Admin/Student/Applications
//api/Admin/Student/Applications?status=2
PARAMS
status
2

Example Request
OK
curl
curl --location '//api/Admin/Student/Applications?status=2'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body
Db
DeleteUser
POST
/api/Db/DeleteUser
//api/Db/DeleteUser?email=string
PARAMS
email
string

Example Request
OK
curl
curl --location --request POST '//api/Db/DeleteUser?email=string'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body