Connect to your project
All projects have a RESTful endpoint that you can use with your project's API key to query and manage your database. These can be obtained from the API settings.
You can initialize a new Supabase client using the createClient() method. The Supabase client is your entrypoint to the rest of the Supabase functionality and is the easiest way to interact with everything we offer within the Supabase ecosystem.
Initializing
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://yuopifjsxagpqcywgddi.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)
Authentication
Supabase works through a mixture of JWT and Key auth.
If no Authorization header is included, the API will assume that you are making a request with an anonymous user.
If an Authorization header is included, the API will "switch" to the role of the user making the request. See the User Management section for more details.
We recommend setting your keys as Environment Variables.
Client API Keys
Client keys allow "anonymous access" to your database, until the user has logged in. After logging in the keys will switch to the user's own login token.
In this documentation, we will refer to the key using the name SUPABASE_KEY.
We have provided you a Client Key to get started. You will soon be able to add as many keys as you like. You can find the anon key in the API Settings page.
CLIENT API KEY
const SUPABASE_KEY = 'SUPABASE_CLIENT_API_KEY'
Example usage
const SUPABASE_URL = "https://yuopifjsxagpqcywgddi.supabase.co"
const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_KEY);
Service Keys
Service keys have FULL access to your data, bypassing any security policies. Be VERY careful where you expose these keys. They should only be used on a server and never on a client or browser.
In this documentation, we will refer to the key using the name SERVICE_KEY.
We have provided you with a Service Key to get started. Soon you will be able to add as many keys as you like. You can find the service_role in the API Settings page.
SERVICE KEY
const SERVICE_KEY = 'SUPABASE_SERVICE_KEY'
Example usage
const SUPABASE_URL = "https://yuopifjsxagpqcywgddi.supabase.co"
const supabase = createClient(SUPABASE_URL, process.env.SERVICE_KEY);
User Management
Supabase makes it easy to manage your users.
Supabase assigns each user a unique ID. You can reference this ID anywhere in your database. For example, you might create a profiles table references the user using a user_id field.
Supabase already has built in the routes to sign up, login, and log out for managing users in your apps and websites.
Sign up
Allow your users to sign up and create a new account.
After they have signed up, all interactions using the Supabase JS client will be performed as "that user".
User signup
let { data, error } = await supabase.auth.signUp({
  email: 'someone@email.com',
  password: 'lEYAkTaGbgvbHiStGJcR'
})
Log in with Email/Password
If an account is created, users can login to your app.
After they have logged in, all interactions using the Supabase JS client will be performed as "that user".
User login
let { data, error } = await supabase.auth.signInWithPassword({
  email: 'someone@email.com',
  password: 'lEYAkTaGbgvbHiStGJcR'
})
Log in with Magic Link via Email
Send a user a passwordless link which they can use to redeem an access_token.
After they have clicked the link, all interactions using the Supabase JS client will be performed as "that user".
User login
let { data, error } = await supabase.auth.signInWithOtp({
  email: 'someone@email.com'
})
Sign Up with Phone/Password
A phone number can be used instead of an email as a primary account confirmation mechanism.
The user will receive a mobile OTP via sms with which they can verify that they control the phone number.
You must enter your own twilio credentials on the auth settings page to enable sms confirmations.
Phone Signup
let { data, error } = await supabase.auth.signUp({
  phone: '+13334445555',
  password: 'some-password'
})
Login via SMS OTP
SMS OTPs work like magic links, except you have to provide an interface for the user to verify the 6 digit number they receive.
You must enter your own twilio credentials on the auth settings page to enable SMS-based Logins.
Phone Login
let { data, error } = await supabase.auth.signInWithOtp({
  phone: '+13334445555'
})
Verify an SMS OTP
Once the user has received the OTP, have them enter it in a form and send it for verification
You must enter your own twilio credentials on the auth settings page to enable SMS-based OTP verification.
Verify Pin
let { data, error } = await supabase.auth.verifyOtp({
  phone: '+13334445555',
  token: '123456',
  type: 'sms'
})
Log in with Third Party OAuth
Users can log in with Third Party OAuth like Google, Facebook, GitHub, and more. You must first enable each of these in the Auth Providers settings here .
View all the available Third Party OAuth providers
After they have logged in, all interactions using the Supabase JS client will be performed as "that user".
Generate your Client ID and secret from: Google, GitHub, GitLab, Facebook, Bitbucket.
Third Party Login
let { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github'
})
User
Get the JSON object for the logged in user.
Get User
const { data: { user } } = await supabase.auth.getUser()
Forgotten Password Email
Sends the user a log in link via email. Once logged in you should direct the user to a new password form. And use "Update User" below to save the new password.
Password Recovery
let { data, error } = await supabase.auth.resetPasswordForEmail(email)
Update User
Update the user with a new email or password. Each key (email, password, and data) is optional
Update User
const { data, error } = await supabase.auth.updateUser({
  email: "new@email.com",
  password: "new-password",
  data: { hello: 'world' }
})
Log out
After calling log out, all interactions using the Supabase JS client will be "anonymous".
User logout
let { error } = await supabase.auth.signOut()
Send a User an Invite over Email
Send a user a passwordless link which they can use to sign up and log in.
After they have clicked the link, all interactions using the Supabase JS client will be performed as "that user".
This endpoint requires you use the service_role_key when initializing the client, and should only be invoked from the server, never from the client.
Invite User
let { data, error } = await supabase.auth.admin.inviteUserByEmail('someone@email.com')
Introduction
All views and tables in the public schema and accessible by the active database role for a request are available for querying.
Non-exposed tables
If you don't want to expose tables in your API, simply add them to a different schema (not the public schema).
Generating types
Docs
Supabase APIs are generated from your database, which means that we can use database introspection to generate type-safe API definitions.
You can generate types from your database either through the Supabase CLI, or by downloading the types file via the button on the right and importing it in your application within src/index.ts.
Generate and download types
Remember to re-generate and download this file as you make changes to your tables.
GraphQL vs Supabase
If you have a GraphQL background, you might be wondering if you can fetch your data in a single round-trip. The answer is yes!
The syntax is very similar. This example shows how you might achieve the same thing with Apollo GraphQL and Supabase.

Still want GraphQL?
If you still want to use GraphQL, you can. Supabase provides you with a full Postgres database, so as long as your middleware can connect to the database then you can still use the tools you love. You can find the database connection details in the settings.
With Apollo GraphQL
const { loading, error, data } = useQuery(gql`
  query GetDogs {
    dogs {
      id
      breed
      owner {
        id
        name
      }
    }
  }
`)
With Supabase
const { data, error } = await supabase
  .from('dogs')
  .select(`
      id, breed,
      owner (id, name)
  `)
JavaScript
Bash
audio_overviews
Description
Click to edit.

Cancel

Save
Column
id
Required
Type
string
Format
uuid
Description
Click to edit.

Cancel

Save
Select id
let { data: audio_overviews, error } = await supabase
  .from('audio_overviews')
  .select('id')
Column
notebook_id
Optional
Type
string
Format
uuid
Description
Click to edit.

Cancel

Save
Select notebook_id
let { data: audio_overviews, error } = await supabase
  .from('audio_overviews')
  .select('notebook_id')
Column
audio_url
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select audio_url
let { data: audio_overviews, error } = await supabase
  .from('audio_overviews')
  .select('audio_url')
Column
transcript
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select transcript
let { data: audio_overviews, error } = await supabase
  .from('audio_overviews')
  .select('transcript')
Column
created_at
Optional
Type
string
Format
timestamp with time zone
Description
Click to edit.

Cancel

Save
Select created_at
let { data: audio_overviews, error } = await supabase
  .from('audio_overviews')
  .select('created_at')
Read rows
To read rows in audio_overviews, use the select method.

Learn more

Read all rows
let { data: audio_overviews, error } = await supabase
  .from('audio_overviews')
  .select('*')
Read specific columns
let { data: audio_overviews, error } = await supabase
  .from('audio_overviews')
  .select('some_column,other_column')
Read referenced tables
let { data: audio_overviews, error } = await supabase
  .from('audio_overviews')
  .select(`
    some_column,
    other_table (
      foreign_key
    )
  `)
With pagination
let { data: audio_overviews, error } = await supabase
  .from('audio_overviews')
  .select('*')
  .range(0, 9)
Filtering
Supabase provides a wide range of filters.

Learn more

With filtering
let { data: audio_overviews, error } = await supabase
  .from('audio_overviews')
  .select("*")

  // Filters
  .eq('column', 'Equal to')
  .gt('column', 'Greater than')
  .lt('column', 'Less than')
  .gte('column', 'Greater than or equal to')
  .lte('column', 'Less than or equal to')
  .like('column', '%CaseSensitive%')
  .ilike('column', '%CaseInsensitive%')
  .is('column', null)
  .in('column', ['Array', 'Values'])
  .neq('column', 'Not equal to')

  // Arrays
  .contains('array_column', ['array', 'contains'])
  .containedBy('array_column', ['contained', 'by'])

  // Logical operators
  .not('column', 'like', 'Negate filter')
  .or('some_column.eq.Some value, other_column.eq.Other value')
Insert rows
insert lets you insert into your tables. You can also insert in bulk and do UPSERT.

insert will also return the replaced values for UPSERT.

Learn more

Insert a row
const { data, error } = await supabase
  .from('audio_overviews')
  .insert([
    { some_column: 'someValue', other_column: 'otherValue' },
  ])
  .select()
Insert many rows
const { data, error } = await supabase
  .from('audio_overviews')
  .insert([
    { some_column: 'someValue' },
    { some_column: 'otherValue' },
  ])
  .select()
Upsert matching rows
const { data, error } = await supabase
  .from('audio_overviews')
  .upsert({ some_column: 'someValue' })
  .select()
Update rows
update lets you update rows. update will match all rows by default. You can update specific rows using horizontal filters, e.g. eq, lt, and is.

update will also return the replaced values for UPDATE.

Learn more

Update matching rows
const { data, error } = await supabase
  .from('audio_overviews')
  .update({ other_column: 'otherValue' })
  .eq('some_column', 'someValue')
  .select()
Delete rows
delete lets you delete rows. delete will match all rows by default, so remember to specify your filters!

Learn more

Delete matching rows
const { error } = await supabase
  .from('audio_overviews')
  .delete()
  .eq('some_column', 'someValue')
Subscribe to changes
Supabase provides realtime functionality and broadcasts database changes to authorized users depending on Row Level Security (RLS) policies.

Learn more

Subscribe to all events
const audioOverviews = supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'audio_overviews' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to inserts
const audioOverviews = supabase.channel('custom-insert-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'audio_overviews' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to updates
const audioOverviews = supabase.channel('custom-update-channel')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'audio_overviews' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to deletes
const audioOverviews = supabase.channel('custom-delete-channel')
  .on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'audio_overviews' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to specific rows
const audioOverviews = supabase.channel('custom-filter-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'audio_overviews', filter: 'column_name=eq.someValue' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
  JavaScript
Bash
documents
Description
Click to edit.

Cancel

Save
Column
id
Required
Type
number
Format
bigint
Description
Click to edit.

Cancel

Save
Select id
let { data: documents, error } = await supabase
  .from('documents')
  .select('id')
Column
content
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select content
let { data: documents, error } = await supabase
  .from('documents')
  .select('content')
Column
metadata
Optional
Type
json
Format
jsonb
Description
Click to edit.

Cancel

Save
Select metadata
let { data: documents, error } = await supabase
  .from('documents')
  .select('metadata')
Column
embedding
Optional
Type
string
Format
extensions.vector(768)
Description
Click to edit.

Cancel

Save
Select embedding
let { data: documents, error } = await supabase
  .from('documents')
  .select('embedding')
Read rows
To read rows in documents, use the select method.

Learn more

Read all rows
let { data: documents, error } = await supabase
  .from('documents')
  .select('*')
Read specific columns
let { data: documents, error } = await supabase
  .from('documents')
  .select('some_column,other_column')
Read referenced tables
let { data: documents, error } = await supabase
  .from('documents')
  .select(`
    some_column,
    other_table (
      foreign_key
    )
  `)
With pagination
let { data: documents, error } = await supabase
  .from('documents')
  .select('*')
  .range(0, 9)
Filtering
Supabase provides a wide range of filters.

Learn more

With filtering
let { data: documents, error } = await supabase
  .from('documents')
  .select("*")

  // Filters
  .eq('column', 'Equal to')
  .gt('column', 'Greater than')
  .lt('column', 'Less than')
  .gte('column', 'Greater than or equal to')
  .lte('column', 'Less than or equal to')
  .like('column', '%CaseSensitive%')
  .ilike('column', '%CaseInsensitive%')
  .is('column', null)
  .in('column', ['Array', 'Values'])
  .neq('column', 'Not equal to')

  // Arrays
  .contains('array_column', ['array', 'contains'])
  .containedBy('array_column', ['contained', 'by'])

  // Logical operators
  .not('column', 'like', 'Negate filter')
  .or('some_column.eq.Some value, other_column.eq.Other value')
Insert rows
insert lets you insert into your tables. You can also insert in bulk and do UPSERT.

insert will also return the replaced values for UPSERT.

Learn more

Insert a row
const { data, error } = await supabase
  .from('documents')
  .insert([
    { some_column: 'someValue', other_column: 'otherValue' },
  ])
  .select()
Insert many rows
const { data, error } = await supabase
  .from('documents')
  .insert([
    { some_column: 'someValue' },
    { some_column: 'otherValue' },
  ])
  .select()
Upsert matching rows
const { data, error } = await supabase
  .from('documents')
  .upsert({ some_column: 'someValue' })
  .select()
Update rows
update lets you update rows. update will match all rows by default. You can update specific rows using horizontal filters, e.g. eq, lt, and is.

update will also return the replaced values for UPDATE.

Learn more

Update matching rows
const { data, error } = await supabase
  .from('documents')
  .update({ other_column: 'otherValue' })
  .eq('some_column', 'someValue')
  .select()
Delete rows
delete lets you delete rows. delete will match all rows by default, so remember to specify your filters!

Learn more

Delete matching rows
const { error } = await supabase
  .from('documents')
  .delete()
  .eq('some_column', 'someValue')
Subscribe to changes
Supabase provides realtime functionality and broadcasts database changes to authorized users depending on Row Level Security (RLS) policies.

Learn more

Subscribe to all events
const documents = supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'documents' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to inserts
const documents = supabase.channel('custom-insert-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'documents' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to updates
const documents = supabase.channel('custom-update-channel')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'documents' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to deletes
const documents = supabase.channel('custom-delete-channel')
  .on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'documents' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to specific rows
const documents = supabase.channel('custom-filter-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'documents', filter: 'column_name=eq.someValue' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
  JavaScript
Bash
n8n_chat_histories
Description
Click to edit.

Cancel

Save
Column
id
Required
Type
number
Format
integer
Description
Click to edit.

Cancel

Save
Select id
let { data: n8n_chat_histories, error } = await supabase
  .from('n8n_chat_histories')
  .select('id')
Column
session_id
Required
Type
string
Format
uuid
Description
Click to edit.

Cancel

Save
Select session_id
let { data: n8n_chat_histories, error } = await supabase
  .from('n8n_chat_histories')
  .select('session_id')
Column
message
Required
Type
json
Format
jsonb
Description
Click to edit.

Cancel

Save
Select message
let { data: n8n_chat_histories, error } = await supabase
  .from('n8n_chat_histories')
  .select('message')
Read rows
To read rows in n8n_chat_histories, use the select method.

Learn more

Read all rows
let { data: n8n_chat_histories, error } = await supabase
  .from('n8n_chat_histories')
  .select('*')
Read specific columns
let { data: n8n_chat_histories, error } = await supabase
  .from('n8n_chat_histories')
  .select('some_column,other_column')
Read referenced tables
let { data: n8n_chat_histories, error } = await supabase
  .from('n8n_chat_histories')
  .select(`
    some_column,
    other_table (
      foreign_key
    )
  `)
With pagination
let { data: n8n_chat_histories, error } = await supabase
  .from('n8n_chat_histories')
  .select('*')
  .range(0, 9)
Filtering
Supabase provides a wide range of filters.

Learn more

With filtering
let { data: n8n_chat_histories, error } = await supabase
  .from('n8n_chat_histories')
  .select("*")

  // Filters
  .eq('column', 'Equal to')
  .gt('column', 'Greater than')
  .lt('column', 'Less than')
  .gte('column', 'Greater than or equal to')
  .lte('column', 'Less than or equal to')
  .like('column', '%CaseSensitive%')
  .ilike('column', '%CaseInsensitive%')
  .is('column', null)
  .in('column', ['Array', 'Values'])
  .neq('column', 'Not equal to')

  // Arrays
  .contains('array_column', ['array', 'contains'])
  .containedBy('array_column', ['contained', 'by'])

  // Logical operators
  .not('column', 'like', 'Negate filter')
  .or('some_column.eq.Some value, other_column.eq.Other value')
Insert rows
insert lets you insert into your tables. You can also insert in bulk and do UPSERT.

insert will also return the replaced values for UPSERT.

Learn more

Insert a row
const { data, error } = await supabase
  .from('n8n_chat_histories')
  .insert([
    { some_column: 'someValue', other_column: 'otherValue' },
  ])
  .select()
Insert many rows
const { data, error } = await supabase
  .from('n8n_chat_histories')
  .insert([
    { some_column: 'someValue' },
    { some_column: 'otherValue' },
  ])
  .select()
Upsert matching rows
const { data, error } = await supabase
  .from('n8n_chat_histories')
  .upsert({ some_column: 'someValue' })
  .select()
Update rows
update lets you update rows. update will match all rows by default. You can update specific rows using horizontal filters, e.g. eq, lt, and is.

update will also return the replaced values for UPDATE.

Learn more

Update matching rows
const { data, error } = await supabase
  .from('n8n_chat_histories')
  .update({ other_column: 'otherValue' })
  .eq('some_column', 'someValue')
  .select()
Delete rows
delete lets you delete rows. delete will match all rows by default, so remember to specify your filters!

Learn more

Delete matching rows
const { error } = await supabase
  .from('n8n_chat_histories')
  .delete()
  .eq('some_column', 'someValue')
Subscribe to changes
Supabase provides realtime functionality and broadcasts database changes to authorized users depending on Row Level Security (RLS) policies.

Learn more

Subscribe to all events
const n8nChatHistories = supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'n8n_chat_histories' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to inserts
const n8nChatHistories = supabase.channel('custom-insert-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'n8n_chat_histories' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to updates
const n8nChatHistories = supabase.channel('custom-update-channel')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'n8n_chat_histories' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to deletes
const n8nChatHistories = supabase.channel('custom-delete-channel')
  .on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'n8n_chat_histories' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to specific rows
const n8nChatHistories = supabase.channel('custom-filter-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'n8n_chat_histories', filter: 'column_name=eq.someValue' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
  JavaScript
Bash
n8n_chat_raw_ai
Description
Click to edit.

Cancel

Save
Column
id
Required
Type
number
Format
integer
Description
Click to edit.

Cancel

Save
Select id
let { data: n8n_chat_raw_ai, error } = await supabase
  .from('n8n_chat_raw_ai')
  .select('id')
Column
session_id
Required
Type
string
Format
uuid
Description
Click to edit.

Cancel

Save
Select session_id
let { data: n8n_chat_raw_ai, error } = await supabase
  .from('n8n_chat_raw_ai')
  .select('session_id')
Column
message
Required
Type
json
Format
jsonb
Description
Click to edit.

Cancel

Save
Select message
let { data: n8n_chat_raw_ai, error } = await supabase
  .from('n8n_chat_raw_ai')
  .select('message')
Column
created_at
Required
Type
string
Format
timestamp with time zone
Description
Click to edit.

Cancel

Save
Select created_at
let { data: n8n_chat_raw_ai, error } = await supabase
  .from('n8n_chat_raw_ai')
  .select('created_at')
Read rows
To read rows in n8n_chat_raw_ai, use the select method.

Learn more

Read all rows
let { data: n8n_chat_raw_ai, error } = await supabase
  .from('n8n_chat_raw_ai')
  .select('*')
Read specific columns
let { data: n8n_chat_raw_ai, error } = await supabase
  .from('n8n_chat_raw_ai')
  .select('some_column,other_column')
Read referenced tables
let { data: n8n_chat_raw_ai, error } = await supabase
  .from('n8n_chat_raw_ai')
  .select(`
    some_column,
    other_table (
      foreign_key
    )
  `)
With pagination
let { data: n8n_chat_raw_ai, error } = await supabase
  .from('n8n_chat_raw_ai')
  .select('*')
  .range(0, 9)
Filtering
Supabase provides a wide range of filters.

Learn more

With filtering
let { data: n8n_chat_raw_ai, error } = await supabase
  .from('n8n_chat_raw_ai')
  .select("*")

  // Filters
  .eq('column', 'Equal to')
  .gt('column', 'Greater than')
  .lt('column', 'Less than')
  .gte('column', 'Greater than or equal to')
  .lte('column', 'Less than or equal to')
  .like('column', '%CaseSensitive%')
  .ilike('column', '%CaseInsensitive%')
  .is('column', null)
  .in('column', ['Array', 'Values'])
  .neq('column', 'Not equal to')

  // Arrays
  .contains('array_column', ['array', 'contains'])
  .containedBy('array_column', ['contained', 'by'])

  // Logical operators
  .not('column', 'like', 'Negate filter')
  .or('some_column.eq.Some value, other_column.eq.Other value')
Insert rows
insert lets you insert into your tables. You can also insert in bulk and do UPSERT.

insert will also return the replaced values for UPSERT.

Learn more

Insert a row
const { data, error } = await supabase
  .from('n8n_chat_raw_ai')
  .insert([
    { some_column: 'someValue', other_column: 'otherValue' },
  ])
  .select()
Insert many rows
const { data, error } = await supabase
  .from('n8n_chat_raw_ai')
  .insert([
    { some_column: 'someValue' },
    { some_column: 'otherValue' },
  ])
  .select()
Upsert matching rows
const { data, error } = await supabase
  .from('n8n_chat_raw_ai')
  .upsert({ some_column: 'someValue' })
  .select()
Update rows
update lets you update rows. update will match all rows by default. You can update specific rows using horizontal filters, e.g. eq, lt, and is.

update will also return the replaced values for UPDATE.

Learn more

Update matching rows
const { data, error } = await supabase
  .from('n8n_chat_raw_ai')
  .update({ other_column: 'otherValue' })
  .eq('some_column', 'someValue')
  .select()
Delete rows
delete lets you delete rows. delete will match all rows by default, so remember to specify your filters!

Learn more

Delete matching rows
const { error } = await supabase
  .from('n8n_chat_raw_ai')
  .delete()
  .eq('some_column', 'someValue')
Subscribe to changes
Supabase provides realtime functionality and broadcasts database changes to authorized users depending on Row Level Security (RLS) policies.

Learn more

Subscribe to all events
const n8nChatRawAi = supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'n8n_chat_raw_ai' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to inserts
const n8nChatRawAi = supabase.channel('custom-insert-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'n8n_chat_raw_ai' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to updates
const n8nChatRawAi = supabase.channel('custom-update-channel')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'n8n_chat_raw_ai' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to deletes
const n8nChatRawAi = supabase.channel('custom-delete-channel')
  .on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'n8n_chat_raw_ai' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to specific rows
const n8nChatRawAi = supabase.channel('custom-filter-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'n8n_chat_raw_ai', filter: 'column_name=eq.someValue' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
  JavaScript
Bash
notebooks
Description
Click to edit.

Cancel

Save
Column
id
Required
Type
string
Format
uuid
Description
Click to edit.

Cancel

Save
Select id
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('id')
Column
user_id
Required
Type
string
Format
uuid
Description
Click to edit.

Cancel

Save
Select user_id
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('user_id')
Column
title
Required
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select title
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('title')
Column
description
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select description
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('description')
Column
color
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select color
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('color')
Column
icon
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select icon
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('icon')
Column
generation_status
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select generation_status
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('generation_status')
Column
audio_overview_generation_status
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select audio_overview_generation_status
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('audio_overview_generation_status')
Column
audio_overview_url
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select audio_overview_url
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('audio_overview_url')
Column
audio_url_expires_at
Optional
Type
string
Format
timestamp with time zone
Description
Click to edit.

Cancel

Save
Select audio_url_expires_at
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('audio_url_expires_at')
Column
example_questions
Optional
Type
Format
text[]
Description
Click to edit.

Cancel

Save
Select example_questions
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('example_questions')
Column
created_at
Required
Type
string
Format
timestamp with time zone
Description
Click to edit.

Cancel

Save
Select created_at
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('created_at')
Column
updated_at
Required
Type
string
Format
timestamp with time zone
Description
Click to edit.

Cancel

Save
Select updated_at
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('updated_at')
Column
week_number
Optional
Type
number
Format
integer
Description
Click to edit.

Cancel

Save
Select week_number
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('week_number')
Read rows
To read rows in notebooks, use the select method.

Learn more

Read all rows
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('*')
Read specific columns
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('some_column,other_column')
Read referenced tables
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select(`
    some_column,
    other_table (
      foreign_key
    )
  `)
With pagination
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select('*')
  .range(0, 9)
Filtering
Supabase provides a wide range of filters.

Learn more

With filtering
let { data: notebooks, error } = await supabase
  .from('notebooks')
  .select("*")

  // Filters
  .eq('column', 'Equal to')
  .gt('column', 'Greater than')
  .lt('column', 'Less than')
  .gte('column', 'Greater than or equal to')
  .lte('column', 'Less than or equal to')
  .like('column', '%CaseSensitive%')
  .ilike('column', '%CaseInsensitive%')
  .is('column', null)
  .in('column', ['Array', 'Values'])
  .neq('column', 'Not equal to')

  // Arrays
  .contains('array_column', ['array', 'contains'])
  .containedBy('array_column', ['contained', 'by'])

  // Logical operators
  .not('column', 'like', 'Negate filter')
  .or('some_column.eq.Some value, other_column.eq.Other value')
Insert rows
insert lets you insert into your tables. You can also insert in bulk and do UPSERT.

insert will also return the replaced values for UPSERT.

Learn more

Insert a row
const { data, error } = await supabase
  .from('notebooks')
  .insert([
    { some_column: 'someValue', other_column: 'otherValue' },
  ])
  .select()
Insert many rows
const { data, error } = await supabase
  .from('notebooks')
  .insert([
    { some_column: 'someValue' },
    { some_column: 'otherValue' },
  ])
  .select()
Upsert matching rows
const { data, error } = await supabase
  .from('notebooks')
  .upsert({ some_column: 'someValue' })
  .select()
Update rows
update lets you update rows. update will match all rows by default. You can update specific rows using horizontal filters, e.g. eq, lt, and is.

update will also return the replaced values for UPDATE.

Learn more

Update matching rows
const { data, error } = await supabase
  .from('notebooks')
  .update({ other_column: 'otherValue' })
  .eq('some_column', 'someValue')
  .select()
Delete rows
delete lets you delete rows. delete will match all rows by default, so remember to specify your filters!

Learn more

Delete matching rows
const { error } = await supabase
  .from('notebooks')
  .delete()
  .eq('some_column', 'someValue')
Subscribe to changes
Supabase provides realtime functionality and broadcasts database changes to authorized users depending on Row Level Security (RLS) policies.

Learn more

Subscribe to all events
const notebooks = supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'notebooks' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to inserts
const notebooks = supabase.channel('custom-insert-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'notebooks' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to updates
const notebooks = supabase.channel('custom-update-channel')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'notebooks' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to deletes
const notebooks = supabase.channel('custom-delete-channel')
  .on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'notebooks' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to specific rows
const notebooks = supabase.channel('custom-filter-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'notebooks', filter: 'column_name=eq.someValue' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
  JavaScript
Bash
notes
Description
Click to edit.

Cancel

Save
Column
id
Required
Type
string
Format
uuid
Description
Click to edit.

Cancel

Save
Select id
let { data: notes, error } = await supabase
  .from('notes')
  .select('id')
Column
notebook_id
Required
Type
string
Format
uuid
Description
Click to edit.

Cancel

Save
Select notebook_id
let { data: notes, error } = await supabase
  .from('notes')
  .select('notebook_id')
Column
title
Required
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select title
let { data: notes, error } = await supabase
  .from('notes')
  .select('title')
Column
content
Required
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select content
let { data: notes, error } = await supabase
  .from('notes')
  .select('content')
Column
source_type
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select source_type
let { data: notes, error } = await supabase
  .from('notes')
  .select('source_type')
Column
extracted_text
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select extracted_text
let { data: notes, error } = await supabase
  .from('notes')
  .select('extracted_text')
Column
created_at
Required
Type
string
Format
timestamp with time zone
Description
Click to edit.

Cancel

Save
Select created_at
let { data: notes, error } = await supabase
  .from('notes')
  .select('created_at')
Column
updated_at
Required
Type
string
Format
timestamp with time zone
Description
Click to edit.

Cancel

Save
Select updated_at
let { data: notes, error } = await supabase
  .from('notes')
  .select('updated_at')
Read rows
To read rows in notes, use the select method.

Learn more

Read all rows
let { data: notes, error } = await supabase
  .from('notes')
  .select('*')
Read specific columns
let { data: notes, error } = await supabase
  .from('notes')
  .select('some_column,other_column')
Read referenced tables
let { data: notes, error } = await supabase
  .from('notes')
  .select(`
    some_column,
    other_table (
      foreign_key
    )
  `)
With pagination
let { data: notes, error } = await supabase
  .from('notes')
  .select('*')
  .range(0, 9)
Filtering
Supabase provides a wide range of filters.

Learn more

With filtering
let { data: notes, error } = await supabase
  .from('notes')
  .select("*")

  // Filters
  .eq('column', 'Equal to')
  .gt('column', 'Greater than')
  .lt('column', 'Less than')
  .gte('column', 'Greater than or equal to')
  .lte('column', 'Less than or equal to')
  .like('column', '%CaseSensitive%')
  .ilike('column', '%CaseInsensitive%')
  .is('column', null)
  .in('column', ['Array', 'Values'])
  .neq('column', 'Not equal to')

  // Arrays
  .contains('array_column', ['array', 'contains'])
  .containedBy('array_column', ['contained', 'by'])

  // Logical operators
  .not('column', 'like', 'Negate filter')
  .or('some_column.eq.Some value, other_column.eq.Other value')
Insert rows
insert lets you insert into your tables. You can also insert in bulk and do UPSERT.

insert will also return the replaced values for UPSERT.

Learn more

Insert a row
const { data, error } = await supabase
  .from('notes')
  .insert([
    { some_column: 'someValue', other_column: 'otherValue' },
  ])
  .select()
Insert many rows
const { data, error } = await supabase
  .from('notes')
  .insert([
    { some_column: 'someValue' },
    { some_column: 'otherValue' },
  ])
  .select()
Upsert matching rows
const { data, error } = await supabase
  .from('notes')
  .upsert({ some_column: 'someValue' })
  .select()
Update rows
update lets you update rows. update will match all rows by default. You can update specific rows using horizontal filters, e.g. eq, lt, and is.

update will also return the replaced values for UPDATE.

Learn more

Update matching rows
const { data, error } = await supabase
  .from('notes')
  .update({ other_column: 'otherValue' })
  .eq('some_column', 'someValue')
  .select()
Delete rows
delete lets you delete rows. delete will match all rows by default, so remember to specify your filters!

Learn more

Delete matching rows
const { error } = await supabase
  .from('notes')
  .delete()
  .eq('some_column', 'someValue')
Subscribe to changes
Supabase provides realtime functionality and broadcasts database changes to authorized users depending on Row Level Security (RLS) policies.

Learn more

Subscribe to all events
const notes = supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'notes' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to inserts
const notes = supabase.channel('custom-insert-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'notes' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to updates
const notes = supabase.channel('custom-update-channel')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'notes' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to deletes
const notes = supabase.channel('custom-delete-channel')
  .on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'notes' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to specific rows
const notes = supabase.channel('custom-filter-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'notes', filter: 'column_name=eq.someValue' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
  JavaScript
Bash
profiles
Description
Click to edit.

Cancel

Save
Column
id
Required
Type
string
Format
uuid
Description
Click to edit.

Cancel

Save
Select id
let { data: profiles, error } = await supabase
  .from('profiles')
  .select('id')
Column
email
Required
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select email
let { data: profiles, error } = await supabase
  .from('profiles')
  .select('email')
Column
full_name
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select full_name
let { data: profiles, error } = await supabase
  .from('profiles')
  .select('full_name')
Column
avatar_url
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select avatar_url
let { data: profiles, error } = await supabase
  .from('profiles')
  .select('avatar_url')
Column
created_at
Required
Type
string
Format
timestamp with time zone
Description
Click to edit.

Cancel

Save
Select created_at
let { data: profiles, error } = await supabase
  .from('profiles')
  .select('created_at')
Column
updated_at
Required
Type
string
Format
timestamp with time zone
Description
Click to edit.

Cancel

Save
Select updated_at
let { data: profiles, error } = await supabase
  .from('profiles')
  .select('updated_at')
Read rows
To read rows in profiles, use the select method.

Learn more

Read all rows
let { data: profiles, error } = await supabase
  .from('profiles')
  .select('*')
Read specific columns
let { data: profiles, error } = await supabase
  .from('profiles')
  .select('some_column,other_column')
Read referenced tables
let { data: profiles, error } = await supabase
  .from('profiles')
  .select(`
    some_column,
    other_table (
      foreign_key
    )
  `)
With pagination
let { data: profiles, error } = await supabase
  .from('profiles')
  .select('*')
  .range(0, 9)
Filtering
Supabase provides a wide range of filters.

Learn more

With filtering
let { data: profiles, error } = await supabase
  .from('profiles')
  .select("*")

  // Filters
  .eq('column', 'Equal to')
  .gt('column', 'Greater than')
  .lt('column', 'Less than')
  .gte('column', 'Greater than or equal to')
  .lte('column', 'Less than or equal to')
  .like('column', '%CaseSensitive%')
  .ilike('column', '%CaseInsensitive%')
  .is('column', null)
  .in('column', ['Array', 'Values'])
  .neq('column', 'Not equal to')

  // Arrays
  .contains('array_column', ['array', 'contains'])
  .containedBy('array_column', ['contained', 'by'])

  // Logical operators
  .not('column', 'like', 'Negate filter')
  .or('some_column.eq.Some value, other_column.eq.Other value')
Insert rows
insert lets you insert into your tables. You can also insert in bulk and do UPSERT.

insert will also return the replaced values for UPSERT.

Learn more

Insert a row
const { data, error } = await supabase
  .from('profiles')
  .insert([
    { some_column: 'someValue', other_column: 'otherValue' },
  ])
  .select()
Insert many rows
const { data, error } = await supabase
  .from('profiles')
  .insert([
    { some_column: 'someValue' },
    { some_column: 'otherValue' },
  ])
  .select()
Upsert matching rows
const { data, error } = await supabase
  .from('profiles')
  .upsert({ some_column: 'someValue' })
  .select()
Update rows
update lets you update rows. update will match all rows by default. You can update specific rows using horizontal filters, e.g. eq, lt, and is.

update will also return the replaced values for UPDATE.

Learn more

Update matching rows
const { data, error } = await supabase
  .from('profiles')
  .update({ other_column: 'otherValue' })
  .eq('some_column', 'someValue')
  .select()
Delete rows
delete lets you delete rows. delete will match all rows by default, so remember to specify your filters!

Learn more

Delete matching rows
const { error } = await supabase
  .from('profiles')
  .delete()
  .eq('some_column', 'someValue')
Subscribe to changes
Supabase provides realtime functionality and broadcasts database changes to authorized users depending on Row Level Security (RLS) policies.

Learn more

Subscribe to all events
const profiles = supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'profiles' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to inserts
const profiles = supabase.channel('custom-insert-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'profiles' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to updates
const profiles = supabase.channel('custom-update-channel')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'profiles' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to deletes
const profiles = supabase.channel('custom-delete-channel')
  .on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'profiles' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to specific rows
const profiles = supabase.channel('custom-filter-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'profiles', filter: 'column_name=eq.someValue' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
  JavaScript
Bash
sources
Description
Click to edit.

Cancel

Save
Column
id
Required
Type
string
Format
uuid
Description
Click to edit.

Cancel

Save
Select id
let { data: sources, error } = await supabase
  .from('sources')
  .select('id')
Column
notebook_id
Required
Type
string
Format
uuid
Description
Click to edit.

Cancel

Save
Select notebook_id
let { data: sources, error } = await supabase
  .from('sources')
  .select('notebook_id')
Column
title
Required
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select title
let { data: sources, error } = await supabase
  .from('sources')
  .select('title')
Column
type
Required
Type
string
Format
public.source_type
Description
Click to edit.

Cancel

Save
Select type
let { data: sources, error } = await supabase
  .from('sources')
  .select('type')
Column
url
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select url
let { data: sources, error } = await supabase
  .from('sources')
  .select('url')
Column
file_path
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select file_path
let { data: sources, error } = await supabase
  .from('sources')
  .select('file_path')
Column
file_size
Optional
Type
number
Format
bigint
Description
Click to edit.

Cancel

Save
Select file_size
let { data: sources, error } = await supabase
  .from('sources')
  .select('file_size')
Column
display_name
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select display_name
let { data: sources, error } = await supabase
  .from('sources')
  .select('display_name')
Column
content
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select content
let { data: sources, error } = await supabase
  .from('sources')
  .select('content')
Column
summary
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select summary
let { data: sources, error } = await supabase
  .from('sources')
  .select('summary')
Column
processing_status
Optional
Type
string
Format
text
Description
Click to edit.

Cancel

Save
Select processing_status
let { data: sources, error } = await supabase
  .from('sources')
  .select('processing_status')
Column
metadata
Optional
Type
json
Format
jsonb
Description
Click to edit.

Cancel

Save
Select metadata
let { data: sources, error } = await supabase
  .from('sources')
  .select('metadata')
Column
created_at
Required
Type
string
Format
timestamp with time zone
Description
Click to edit.

Cancel

Save
Select created_at
let { data: sources, error } = await supabase
  .from('sources')
  .select('created_at')
Column
updated_at
Required
Type
string
Format
timestamp with time zone
Description
Click to edit.

Cancel

Save
Select updated_at
let { data: sources, error } = await supabase
  .from('sources')
  .select('updated_at')
Read rows
To read rows in sources, use the select method.

Learn more

Read all rows
let { data: sources, error } = await supabase
  .from('sources')
  .select('*')
Read specific columns
let { data: sources, error } = await supabase
  .from('sources')
  .select('some_column,other_column')
Read referenced tables
let { data: sources, error } = await supabase
  .from('sources')
  .select(`
    some_column,
    other_table (
      foreign_key
    )
  `)
With pagination
let { data: sources, error } = await supabase
  .from('sources')
  .select('*')
  .range(0, 9)
Filtering
Supabase provides a wide range of filters.

Learn more

With filtering
let { data: sources, error } = await supabase
  .from('sources')
  .select("*")

  // Filters
  .eq('column', 'Equal to')
  .gt('column', 'Greater than')
  .lt('column', 'Less than')
  .gte('column', 'Greater than or equal to')
  .lte('column', 'Less than or equal to')
  .like('column', '%CaseSensitive%')
  .ilike('column', '%CaseInsensitive%')
  .is('column', null)
  .in('column', ['Array', 'Values'])
  .neq('column', 'Not equal to')

  // Arrays
  .contains('array_column', ['array', 'contains'])
  .containedBy('array_column', ['contained', 'by'])

  // Logical operators
  .not('column', 'like', 'Negate filter')
  .or('some_column.eq.Some value, other_column.eq.Other value')
Insert rows
insert lets you insert into your tables. You can also insert in bulk and do UPSERT.

insert will also return the replaced values for UPSERT.

Learn more

Insert a row
const { data, error } = await supabase
  .from('sources')
  .insert([
    { some_column: 'someValue', other_column: 'otherValue' },
  ])
  .select()
Insert many rows
const { data, error } = await supabase
  .from('sources')
  .insert([
    { some_column: 'someValue' },
    { some_column: 'otherValue' },
  ])
  .select()
Upsert matching rows
const { data, error } = await supabase
  .from('sources')
  .upsert({ some_column: 'someValue' })
  .select()
Update rows
update lets you update rows. update will match all rows by default. You can update specific rows using horizontal filters, e.g. eq, lt, and is.

update will also return the replaced values for UPDATE.

Learn more

Update matching rows
const { data, error } = await supabase
  .from('sources')
  .update({ other_column: 'otherValue' })
  .eq('some_column', 'someValue')
  .select()
Delete rows
delete lets you delete rows. delete will match all rows by default, so remember to specify your filters!

Learn more

Delete matching rows
const { error } = await supabase
  .from('sources')
  .delete()
  .eq('some_column', 'someValue')
Subscribe to changes
Supabase provides realtime functionality and broadcasts database changes to authorized users depending on Row Level Security (RLS) policies.

Learn more

Subscribe to all events
const sources = supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'sources' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to inserts
const sources = supabase.channel('custom-insert-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'sources' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to updates
const sources = supabase.channel('custom-update-channel')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'sources' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to deletes
const sources = supabase.channel('custom-delete-channel')
  .on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'sources' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
Subscribe to specific rows
const sources = supabase.channel('custom-filter-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'sources', filter: 'column_name=eq.someValue' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
  JavaScript
Bash
Introduction
All of your database stored procedures are available on your API. This means you can build your logic directly into the database (if you're brave enough)!

The API endpoint supports POST (and in some cases GET) to execute the function.
JavaScript
Bash
is_notebook_owner
Description
Click to edit.

Cancel

Save
Invoke function
let { data, error } = await supabase
  .rpc('is_notebook_owner', {
    notebook_id_param
  })
if (error) console.error(error)
else console.log(data)
Function Arguments
Column
notebook_id_param
Required
Type
string
Format
uuid
JavaScript
Bash
is_notebook_owner_for_document
Description
Click to edit.

Cancel

Save
Invoke function
let { data, error } = await supabase
  .rpc('is_notebook_owner_for_document', {
    doc_metadata
  })
if (error) console.error(error)
else console.log(data)
Function Arguments
Column
doc_metadata
Required
Type
json
Format
jsonb
JavaScript
Bash
match_documents
Description
Click to edit.

Cancel

Save
Invoke function
let { data, error } = await supabase
  .rpc('match_documents', {
    filter, 
    match_count, 
    query_embedding
  })
if (error) console.error(error)
else console.log(data)
Function Arguments
Column
filter
Required
Type
json
Format
jsonb
Column
match_count
Required
Type
number
Format
integer
Column
query_embedding
Required
Type
string
Format
extensions.vector
