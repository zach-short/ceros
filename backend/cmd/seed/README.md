# User Seed Command

This CLI tool seeds your database with test users for development and testing purposes.

## Features

- 🎨 **Gender-Specific Dicebear Avatars**: Each user gets a unique avatar from [dicebear.com](https://dicebear.com) with gender matching their name
- 📧 **Predictable Emails**: `test@test.com`, `test2@test.com`, `test3@test.com`, etc.
- 🔒 **Bcrypt Passwords**: `password`, `password2`, `password3`, etc. (hashed with bcrypt)
- 👤 **Random Names**: Real first and last names with 50/50 gender split (e.g., "👨 John Bendex", "👩 Kate Wilson")
- 🏷️ **Unique Usernames**: Generated from names with variations (e.g., "jbendex", "katewilson42", "john_cool")

## Usage

### Seed 10 Users (default)

```bash
cd backend
go run cmd/seed/main.go
```

### Seed Custom Number of Users

```bash
go run cmd/seed/main.go -count 50
```

### Clear Existing Test Users Before Seeding

```bash
go run cmd/seed/main.go -count 20 -clear
```

### Clear All Test Users Only (no seeding)

```bash
go run cmd/seed/main.go -clear-only
```

## Login Credentials

After seeding, you can log in with:

| Email          | Password  |
| -------------- | --------- |
| test@test.com  | password  |
| test2@test.com | password2 |
| test3@test.com | password3 |
| test4@test.com | password4 |
| ...            | ...       |

## Example Output

```
🌱 Seeding 10 users...
✅ Created user 1: 👨 James Smith (jsmith42) - test@test.com / password
✅ Created user 2: 👩 Mary Johnson (maryjohnson) - test2@test.com / password2
✅ Created user 3: 👨 John Bendex (j3bendex) - test3@test.com / password3
✅ Created user 4: 👩 Katherine Wilson (katewilson123) - test4@test.com / password4
...
🎉 Successfully seeded 10 users!

📝 Login credentials:
   test@test.com / password
   test2@test.com / password2
   test3@test.com / password3
   ... etc.
```

## Requirements

- MongoDB connection (uses `DATABASE_URL` from `.env`)
- Go 1.21+
- `backend/.env` file configured

## Notes

- Skips users that already exist (checks email)
- All test users have the email pattern `test*@test.com`
- Use `-clear` flag to remove existing test users before creating new ones
- Generated avatars are from the "avataaars" style on dicebear with gender parameter
- Names are randomly assigned as male (48 names) or female (56 names) with 50/50 probability
- Avatars automatically match the gender of the assigned name
