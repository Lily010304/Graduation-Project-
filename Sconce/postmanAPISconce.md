
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
  "email": "string",
  "fullName": "string",
  "password": "string"
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
{
  "message": "string"
}


ApproveParentLink
GET
/api/Student/Account/ApproveParentLink
//api/Student/Account/ApproveParentLink?token=string
PARAMS
token
string

Example Request
OK
curl
curl --location '//api/Student/Account/ApproveParentLink?token=string'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body



POST
/api/Student/Application/Apply
//api/Student/Application/Apply
HEADERS
Content-Type
multipart/form-data

Body
formdata
City
string

Country
string

DateOfBirth
1999-12-27

Document
Email
string

Gender
2

PhoneNumber
string

Street
string

GuardianName
string

GuardianEmail
string

LevelOfProficiency
4

Example Request
OK
View More
curl
curl --location '//api/Student/Application/Apply' \
--header 'Content-Type: multipart/form-data' \
--form 'City="string"' \
--form 'Country="string"' \
--form 'DateOfBirth="1999-12-27"' \
--form 'Document=@"/path/to/file"' \
--form 'Email="string"' \
--form 'Gender="2"' \
--form 'PhoneNumber="string"' \
--form 'Street="string"' \
--form 'GuardianName="string"' \
--form 'GuardianEmail="string"' \
--form 'LevelOfProficiency="4"'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body

Status
GET
/api/Student/Application/Status
//api/Student/Application/Status?email=string
PARAMS
email
string

Example Request
OK
curl
curl --location '//api/Student/Application/Status?email=string'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body


RegisterParent
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
  "dateOfBirth": "2008-10-21",
  "email": "mxfca@aPhlRMKVdfAvbvHccXguimPJPXEu.dh",
  "fullName": "string",
  "gender": 0,
  "password": "string",
  "relationshipWithStudent": "string",
  "studentEmail": "9YT3l@roYL.bhk"
}
Example Request
OK
View More
curl
curl --location '//api/Parent/Account/RegisterParent' \
--header 'Content-Type: application/json' \
--header 'Accept: text/plain' \
--data-raw '{
  "dateOfBirth": "2008-10-21",
  "email": "mxfca@aPhlRMKVdfAvbvHccXguimPJPXEu.dh",
  "fullName": "string",
  "gender": 0,
  "password": "string",
  "relationshipWithStudent": "string",
  "studentEmail": "9YT3l@roYL.bhk"
}'
200 OK
Example Response
Body
Headers (1)
json
{
  "message": "string"
}

RegisterParentWithInvite
POST
/api/Parent/Account/RegisterParentWithInvite
//api/Parent/Account/RegisterParentWithInvite
HEADERS
Content-Type
application/json

Body
raw (json)
json
{
  "dateOfBirth": "1993-04-11",
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
--data '{
  "dateOfBirth": "1993-04-11",
  "fullName": "string",
  "gender": 0,
  "password": "stringstring",
  "relationshipWithStudent": "string",
  "token": "string"
}'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body


Account
Login
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
  "email": "string",
  "password": "string"
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
{
  "message": "string"
}

ConfirmEmail
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
{
  "message": "string"
}

ForgotPassword
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
  "email": "string"
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
{
  "message": "string"
}

ResetPassword
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
{
  "message": "string"
}


POST
/api/Instructor/Application/Apply
//api/Instructor/Application/Apply
HEADERS
Content-Type
multipart/form-data

Body
formdata
City
string

Country
string

CV
DateOfBirth
1947-03-08

Email
mV15@nmDvBTEomoCcOocm.bant

FullName
string

Gender
0

PhoneNumber
string

YearsOfExperience
6807

Street
string

ExperienceWithTeachingKids
true

Example Request
OK
View More
curl
curl --location '//api/Instructor/Application/Apply' \
--header 'Content-Type: multipart/form-data' \
--form 'City="string"' \
--form 'Country="string"' \
--form 'CV=@"/path/to/file"' \
--form 'DateOfBirth="1947-03-08"' \
--form 'Email="mV15@nmDvBTEomoCcOocm.bant"' \
--form 'FullName="string"' \
--form 'Gender="0"' \
--form 'PhoneNumber="string"' \
--form 'YearsOfExperience="6807"' \
--form 'Street="string"' \
--form 'ExperienceWithTeachingKids="true"'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body

Status
GET
/api/Instructor/Application/Status
//api/Instructor/Application/Status?email=string
PARAMS
email
string

Example Request
OK
curl
curl --location '//api/Instructor/Application/Status?email=string'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body


GET
/api/Admin/Course
//api/Admin/Course?onlyActive=false
PARAMS
onlyActive
false

Example Request
OK
curl
curl --location '//api/Admin/Course?onlyActive=false'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body
POST
/api/Admin/Course
//api/Admin/Course
HEADERS
Content-Type
application/json

Body
raw (json)
json
{
  "name": "string",
  "programId": 9252,
  "description": "string"
}
Example Request
OK
curl
curl --location '//api/Admin/Course' \
--header 'Content-Type: application/json' \
--data '{
  "name": "string",
  "programId": 9252,
  "description": "string"
}'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body


GET
/api/Admin/Instructor/Applications/:id
//api/Admin/Instructor/Applications/:id
PATH VARIABLES
id
6047

Example Request
OK
curl
curl --location '//api/Admin/Instructor/Applications/6047'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body
GET
/api/Admin/Instructor/Applications
//api/Admin/Instructor/Applications?status=1
PARAMS
status
1

Example Request
OK
curl
curl --location '//api/Admin/Instructor/Applications?status=1'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body


GET
/api/Admin/Program
//api/Admin/Program?onlyActive=false
PARAMS
onlyActive
false

Example Request
OK
curl
curl --location '//api/Admin/Program?onlyActive=false'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body
POST
/api/Admin/Program
//api/Admin/Program
HEADERS
Content-Type
application/json

Body
raw (json)
json
{
  "name": "string",
  "description": "string"
}
Example Request
OK
curl
curl --location '//api/Admin/Program' \
--header 'Content-Type: application/json' \
--data '{
  "name": "string",
  "description": "string"
}'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body


GET
/api/Admin/Section
//api/Admin/Section?onlyActive=false
PARAMS
onlyActive
false

Example Request
OK
curl
curl --location '//api/Admin/Section?onlyActive=false'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body
POST
/api/Admin/Section
//api/Admin/Section
HEADERS
Content-Type
application/json

Body
raw (json)
json
{
  "courseId": 6128,
  "name": "string",
  "description": "string"
}
Example Request
OK
curl
curl --location '//api/Admin/Section' \
--header 'Content-Type: application/json' \
--data '{
  "courseId": 6128,
  "name": "string",
  "description": "string"
}'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body


GET
/api/Admin/Student/Applications/:id
//api/Admin/Student/Applications/:id
PATH VARIABLES
id
6047

Example Request
OK
curl
curl --location '//api/Admin/Student/Applications/6047'
200 OK
Example Response
Body
Headers (0)
No response body
This request doesn't return any response body
GET
/api/Admin/Student/Applications
//api/Admin/Student/Applications?status=1
PARAMS
status
1

Example Request
OK
curl
curl --location '//api/Admin/Student/Applications?status=1'
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