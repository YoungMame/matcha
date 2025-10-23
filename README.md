# matcha

TODOS : 
1) Registration & Signing-in :
- Sign up and Sign in pages
	- email, username, last & first names, password
	- email verification
	- password reset
	- logout in 1 click from any page
	
- Tickets Front :
	- Page d'inscription + vérif email
	- Page de connexion 
	- Page reset password
	- Logout Button

2) User profile :
- User completes his profile with :
	- Gender
	- Sexual preferences
	- Biography
	- List of interests using tags (#vegan, #geek)
	- Up to 5 pictures, 1 for PP
	- Ability to update these informations & account info
	- User must be able to see who viewed their profile
	- User must be able to see who liked them
	- Each user have a public fame rating
	- GPS tracking, other way of location tracking, customize GPS precision

- Tickets Front :
	- Pages creation du profil
	- Page Profil perso uniquement
	- Vue historique des visites
	- Vue des likes

3) Browsing :
- Access a list of suggested profiles :
	- By default users are bisexual
	- Match are intelligently determined : proximity, shared tags, fame rating... priority to location
	- Profiles sortable by age, location, "fame rating", common tags
	- Profiles filterable by age, location, "fame rating", common tags

- Tickets Front :
	- Page with suggested profiles

4) Research :
- Specify in search :
	- Age range
	- Fame rating range
	- A location
	- One or multiple interests tags
- For results Same filtering/sorting abilities than in Browsing

- Tickets Front :
	- Search bar UI
	- Results page

5) Profile view :
- Ability to view other users' profiles :
	- A profile displays all available information except for the email address and password
	- Record the visit in the visit history
	- Ability to like / unlike the profile (check subject rules)
	- See if the user is connected or not
	- Ability to report fake accounts
	- Block user (check subject rules)
	- Clear display of liked & connection status (see subject rules)

- Tickets Front :
	- Public profile

6) Chat :
- Ability for two connected user to chat in real-time (<10 s delay) :
	- Chat must be displayed on any page

- Tickets Front :
	- Global chat on website

7) Notifications :
- User must receive real-time (< 10 s) notifications for :
	- When they receive a like
	- When their profile has been viewed
	- When they receive a message
	- When a user they liked likes back
	- When a user unlikes them
	- Users should see notifications from any pages

- Tickets Front :
	- Global Notifications on website

8) Bonus :
- OmniAuth strategies for auth
- Allow users to create a personal photo gallery (see subjects rules)
- Develop an interactive map of users
- Integrate video / audio chat for connected users
- Implement a feature to schedule real-life dates / events for matched users

Evaluation :
- Your code must not produce any errors, warnings, or notices, either server-side or client-side (in the web console).
- Anything not explicitly authorized is strictly forbidden.
- Any security breach will result in a score of 0.

to seed do 

docker exec -it fastify-app sh
pnpm run seed