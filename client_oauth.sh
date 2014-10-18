#!/bin/bash

#COOKIE_TMP_FILE=".tmp_cookie"

#USER_EMAIL="demo@didgeridoo.io"
#USER_PASSWORD="1234"

CLIENT_ID="53f50afbce54254407000001"
CLIENT_SECRET="1234"
REDIRECT_URI="https://www.getpostman.com/oauth2/callback"

# Remove tmp cookies
#rm -rf "$COOKIE_TMP_FILE"

# LOGIN
#LOGIN=$(curl http://api.didgeridoo.dev:3000/login -b $COOKIE_TMP_FILE -c $COOKIE_TMP_FILE -d "email=$USER_EMAIL&password=$USER_PASSWORD")

# Parse user_id from login
# USER_ID=$(echo $LOGIN | grep -Po '(?<="id": ")[^"]*')

# AUTHORIZATION
#AUTHORIZATION=$(curl -b $COOKIE_TMP_FILE "http://api.didgeridoo.dev:3000/authorize/?client_id=$CLIENT_ID&response_type=code&redirect_uri=$REDIRECT_URI")
#TRANSACTION_ID=$(echo $AUTHORIZATION | perl -nle'print $& if m{(?<="transactionID": ")[^"]*}')

# Workaround to parse code
#WORKAROUND_CODE=$(curl http://api.didgeridoo.dev:3000/authorize/decision -b $COOKIE_TMP_FILE -d "transaction_id=$TRANSACTION_ID&client_id=$CLIENT_ID")
#CODE=$(echo $WORKAROUND_CODE | perl -nle'print $& if m{(?<=code\=)[^=]*}')

# Token
#TOKEN=$(curl http://api.didgeridoo.dev:3000/token -d "code=$CODE&client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&redirect_uri=$REDIRECT_URI&grant_type=authorization_code")
#echo $TOKEN
#ACCESS_TOKEN=$(echo $TOKEN | perl -nle'print $& if m{(?<="access_token":")[^"]*}')

# Token
#CODE="968e65c746e8c0d8b3e1eefe5946aa2cd6eede4c"
#TOKEN=$(curl http://localhost:3000/oauth2/token -d "code=$CODE&client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&redirect_uri=$REDIRECT_URI&grant_type=authorization_code")
#echo $TOKEN
#ACCESS_TOKEN=$(echo $TOKEN | perl -nle'print $& if m{(?<="access_token":")[^"]*}')



# Get protected resource
ACCESS_TOKEN="79ea15f689503ebe483db336a53520917cfad6ab"
#echo $(curl -H "Authorization: Bearer $ACCESS_TOKEN" -v "http://localhost:3000/users/0")
echo $(curl -v "http://localhost:3000/users/0?access_token=$ACCESS_TOKEN")
# echo $(curl -b $COOKIE_TMP_FILE -v "http://localhost:3000/info/?access_token=$ACCESS_TOKEN")

# Logout
#echo $(curl http://api.didgeridoo.dev:3000/logout -b $COOKIE_TMP_FILE -d "")
