# Test User Seeding Guide

## Quick Start

```bash
cd backend
make seed
```

That's it! You now have 10 test users ready to use.

## Login Credentials

| Email | Password | Example Username | Example Name |
|-------|----------|------------------|--------------|
| test@test.com | password | jsmith42 | James Smith |
| test2@test.com | password2 | maryjohnson | Mary Johnson |
| test3@test.com | password3 | j3bendex | John Bendex |
| test4@test.com | password4 | katewilson123 | Kate Wilson |
| ... | ... | ... | ... |

## Features

Each seeded user has:
- **Unique gender-specific dicebear avatar** (avataaars style with gender parameter)
- **Real randomized name** (48 male names + 56 female names × 80 last names)
- **Gender-matched avatars** (male avatars for male names, female avatars for female names)
- **Creative username** (generated from their name with variations like "j3bendex", "katewilson123", "johncool")
- **Bcrypt-hashed password** (secure but predictable pattern for testing)

## Commands

### Using Make (Recommended)
```bash
# Seed 10 users (default)
make seed

# Seed 50 users
make seed-50

# Clear existing test users and seed 10 new ones
make seed-clear

# Remove all test users
make clear-users

# See all available commands
make help
```

### Using Go Run Directly
```bash
# Seed 10 users (default)
go run cmd/seed/main.go

# Seed custom number of users
go run cmd/seed/main.go -count 25

# Clear existing test users before seeding
go run cmd/seed/main.go -count 10 -clear

# Only clear test users (don't seed)
go run cmd/seed/main.go -clear-only
```

### Using the Compiled Binary
```bash
# Build first
go build -o bin/seed cmd/seed/main.go

# Then run
./bin/seed -count 20
```

## Example Output

```
🌱 Seeding 10 users...
✅ Created user 1: 👨 James Smith (jsmith42) - test@test.com / password
✅ Created user 2: 👩 Mary Johnson (maryjohnson) - test2@test.com / password2
✅ Created user 3: 👨 John Bendex (j3bendex) - test3@test.com / password3
✅ Created user 4: 👩 Katherine Wilson (katewilson123) - test4@test.com / password4
✅ Created user 5: 👨 Michael Brown (michaelbrown) - test5@test.com / password5
✅ Created user 6: 👩 Sarah Davis (sarahd99) - test6@test.com / password6
✅ Created user 7: 👨 Robert Garcia (robertg) - test7@test.com / password7
✅ Created user 8: 👩 Jennifer Miller (jenniferlove) - test8@test.com / password8
✅ Created user 9: 👨 William Anderson (wanderson777) - test9@test.com / password9
✅ Created user 10: 👩 Linda Taylor (lindataylor) - test10@test.com / password10
🎉 Successfully seeded 10 users!

📝 Login credentials:
   test@test.com / password
   test2@test.com / password2
   test3@test.com / password3
   ... etc.
```

## Username Generation Patterns

The seed function creates creative, non-repeating usernames using these patterns:
- First initial + last name + number (e.g., "jsmith42")
- First name + last initial + number (e.g., "johns3")
- First name + suffix + number (e.g., "johnlove123")
- Last name + suffix + number (e.g., "smithcool")
- First initial + last + suffix + number (e.g., "jsmithpro99")
- Full name concatenated + number (e.g., "johnsmith777")

Suffixes include: love, cool, star, pro, king, queen, real, official, the, boss, legend, master, super, ultra, mega, elite, prime, ace

## Avatar Examples

Each user gets a unique gender-specific avatar from dicebear:
- test@test.com (👨 James): https://api.dicebear.com/7.x/avataaars/svg?seed=jsmith42&gender=male
- test2@test.com (👩 Mary): https://api.dicebear.com/7.x/avataaars/svg?seed=maryjohnson&gender=female
- test3@test.com (👨 John): https://api.dicebear.com/7.x/avataaars/svg?seed=j3bendex&gender=male

The `gender` parameter ensures that male names get male avatars and female names get female avatars.

You can change the avatar style in `/backend/utils/seed.go` by modifying the `GenerateDicebearAvatar` function.
Available styles: `avataaars`, `bottts`, `identicon`, `pixel-art`, `avataaars-neutral`, and more.
Note: Not all styles support the gender parameter.

## Notes

- Seeding is **idempotent** - running it multiple times won't create duplicates (checks email)
- All test users match the pattern `test*@test.com` for easy cleanup
- Use `-clear` flag to remove existing test users before seeding new ones
- Default user settings are applied (theme: system, privacy settings, etc.)

## Files Created

- `/backend/utils/seed.go` - Seed logic and helper functions
- `/backend/cmd/seed/main.go` - CLI command
- `/backend/Makefile` - Convenient make commands
