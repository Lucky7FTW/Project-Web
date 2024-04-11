// Import the Firebase modules needed for the functionality
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getDatabase, ref, set, get, push } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

// Firebase configuration from your Firebase project
const firebaseConfig = {
    apiKey: "AIzaSyB6-HHX0VXjBf8DsvpzM6yByxQ4OdbRW0U",
    authDomain: "bebano-e8ad1.firebaseapp.com",
    databaseURL: "https://bebano-e8ad1-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "bebano-e8ad1",
    storageBucket: "bebano-e8ad1.appspot.com",
    messagingSenderId: "341814473638",
    appId: "1:341814473638:web:fb2eb3c9e65983b1745567",
    measurementId: "G-X03SQJQRG8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);


// Function to register a new user with validation
function registerNewUser(email, password, username) {
    // Disable signup button to prevent multiple submissions
    const signupButton = document.getElementById('signup-submit');
    signupButton.disabled = true;
    
    if (password.length < 6) {
        const error = new Error("Password must be at least 6 characters long.");
        console.error(error.message);
        signupButton.disabled = false;  // Re-enable button on error
        return Promise.reject(error);  // Reject without alerting here
    }

    return createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log("User registered successfully with UID:", userCredential.user.uid);
            const userId = userCredential.user.uid;

            // Ensuring data is set in the database before proceeding
            return set(ref(database, 'users/' + userId), {
                email: email,
                username: username,
                balance: 0  // Set the initial balance to 0
            }).then(() => {
                closeModal();
                return userCredential.user;  // Return user info after successful write
            });
        })
        .catch((error) => {
            console.error("Error in user registration:", error.message);
            signupButton.disabled = false;  // Re-enable button on error
            return Promise.reject(error);  // Just propagate the error
        });
}

// Function to show the sign-up modal
function showModal() {
  const modal = document.getElementById('signup-modal');
  modal.style.display = 'block';
}

// Function to close the sign-up modal
function closeModal() {
  const modal = document.getElementById('signup-modal');
  modal.style.display = 'none';
}

// Function to show the login modal
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    modal.style.display = 'block';
}

// Function to close the login modal
function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    modal.style.display = 'none';
}

// Adjusted event listener for form submission
document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const username = document.getElementById('signup-username').value;

    registerNewUser(email, password,username)
        .then(user => {
            console.log("Signup successful, user info:", user);
        })
        .catch(error => {
            if (error.code === 'auth/email-already-in-use') {
                alert("This email is already in use. Please use a different email.");
            } else if (error.message === "Password must be at least 6 characters long.") {
                alert(error.message);
            } else {
                alert("Error in registration: " + error.message);
            }
            console.error("Signup failed:", error.message);
        });
});
 
  document.querySelector('#signup-modal .close-button').addEventListener('click', function() {
    var modal = document.getElementById('signup-modal');
    modal.style.display = 'none';
});

//Login Functionality
function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        console.log("User logged in successfully:", userCredential.user.email);
        return userCredential.user;
      })
      .catch(error => {
        console.error("Error in user login:", error.message);
        alert("Login failed: " + error.message);  // Alert login failure
        return Promise.reject(error);
      });
  }

document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
  
    loginUser(email, password)
      .then(user => {
        console.log("Login successful, user info:", user);
        closeLoginModal()
        alert("Logged in successfully!");  // Alert login success

        // Update UI after login
        document.getElementById('login-link').style.display = 'none';  // Hide login button
        document.getElementById('signin-link').style.display = 'none';  // Hide sign up button
        document.getElementById('profile-link').style.display = 'block'; // Show profile button
      })
      .catch(error => {
        console.error("Login failed:", error.message);
        // Here you can update the UI to reflect the error if needed
      });
  });

  document.getElementById('login-link').addEventListener('click', function() {
    var modal = document.getElementById('login-modal');
    modal.style.display = 'block';
});

document.querySelector('#login-modal .close-button').addEventListener('click', function() {
    var modal = document.getElementById('login-modal');
    modal.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function() {
    // Place your event listeners here
    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
    
        loginUser(email, password)
            .then(user => {
                console.log("Login successful, user info:", user);
            })
            .catch(error => {
                console.error("Login failed:", error.message);
            });
    });
});

document.getElementById('profile-link').addEventListener('click', function() {
    console.log("Profile link clicked");
    var profileSection = document.getElementById('profile-section');
    console.log("Current display style:", profileSection.style.display);
    if (profileSection.style.display === 'none' || !profileSection.style.display) {
        profileSection.style.display = 'block';
    } else {
        profileSection.style.display = 'none';
    }
});


onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed");
    
    if (user) {
        console.log("User is signed in:", user.uid);
        const email = user.email;
        const userId = user.uid;
        const userRef = ref(database, 'users/' + userId);
        
        document.getElementById('login-link').style.display = 'none';  // Hide login button
        document.getElementById('signin-link').style.display = 'none';  // Hide sign up button
        document.getElementById('profile-link').style.display = 'block'; // Show profile button

        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                console.log("User data fetched:", userData);
                const dbEmail = userData.email || email; // Fallback to auth email if not in db
                const username = userData.username; // Username from the database
                const balance = userData.balance; // Assuming 'balance' is stored in your database

                // Populate the form fields with data from the database
                document.getElementById('profile-email').value = dbEmail;
                document.getElementById('profile-username').value = username;
                document.getElementById('user-balance').textContent = balance;
            } else {
                // No data found in the database for this user
                console.log("No user data available in the database.");
                document.getElementById('profile-email').value = email || 'No email set';
                document.getElementById('profile-username').value = 'No username set';
            }
        }).catch((error) => {
            console.error("Failed to fetch user data from the database:", error);
        });
    } else {
        // User is signed out
        console.log("No user is signed in.");
    }
});

document.getElementById('close-profile').addEventListener('click', function() {
    var profileSection = document.getElementById('profile-section');
    if (profileSection) {
        profileSection.style.display = 'none';
    }
});
document.getElementById('logout-button').addEventListener('click', function() {
    auth.signOut().then(() => {
        console.log('User logged out successfully.');
        // Redirect to home page or login page as needed
        window.location.href = '/'; // Adjust as necessary
    }).catch((error) => {
        // An error happened during the logout
        console.error('Logout failed', error);
    });
});

function fetchAndUpdateBalance() {
    const user = auth.currentUser; // Get the currently signed-in user
    if (user) {
        const userId = user.uid;
        const userRef = ref(database, 'users/' + userId);
        
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const balance = userData.balance; // Assuming 'balance' is stored in your database
                
                // Display the balance
                document.getElementById('user-balance').textContent = balance;
            } else {
                console.log("No user data available in the database.");
            }
        }).catch((error) => {
            console.error("Failed to fetch user data from the database:", error);
        });
    } else {
        console.log("No user is signed in.");
    }
}

document.getElementById('refresh-balance').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default button action
    fetchAndUpdateBalance(); // Call the function to update the balance
});

async function getCurrentUserBalance() {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        try {
            const userRef = ref(database, 'users/' + userId);
            const snapshot = await get(userRef);
            if (snapshot.exists() && snapshot.val().balance !== undefined) {
                return snapshot.val().balance;
            } else {
                console.log("Balance not found, setting default to 0");
                await set(ref(database, `users/${userId}/balance`), 0); // Optional: Initialize balance if not set
                return 0; // Default balance if not set
            }
        } catch (error) {
            console.error("Failed to fetch user balance:", error);
            throw new Error("Failed to fetch balance");
        }
    } else {
        console.log("No user signed in.");
        return 0; // Return 0 or handle appropriately if no user is signed in
    }
}


async function updateUserBalance(newBalance) {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        try {
            await set(ref(database, `users/${userId}/balance`), newBalance);
            console.log("Balance updated successfully.");
        } catch (error) {
            console.error("Failed to update user balance:", error);
            throw new Error("Failed to update balance");
        }
    } else {
        console.log("No user signed in.");
        // Handle appropriately if no user is signed in
    }
}

async function storeBetDetails(betDetails) {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        try {
            // Assuming `bets` is a direct child of the root and you want to store bets under each user's UID
            const betsRef = ref(database, `users/${userId}/bets`);
            // Creates a new reference for this bet under the user's bets and pushes the betDetails
            const newBetRef = push(betsRef);
            await set(newBetRef, betDetails);
            console.log("Bet details stored successfully.");
        } catch (error) {
            console.error("Failed to store bet details:", error);
            throw new Error("Failed to store bet details");
        }
    } else {
        console.log("No user signed in to store bet details.");
    }
}
document.getElementById('add-credits-button').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get the current date
    const currentDate = new Date().toDateString();

    // Check if the button has been clicked today
    const lastClickedDate = localStorage.getItem('lastClickedDate');
    if (lastClickedDate === currentDate) {
        // If the button has been clicked today, alert the user
        alert('You can only add credits once per day.');
        return;
    }

    // If the button hasn't been clicked today, add credits
    // Update the user's balance
    const userBalanceElement = document.getElementById('user-balance');
    let currentBalance = parseInt(userBalanceElement.textContent);
    currentBalance += 100; // Add 100 credits
    userBalanceElement.textContent = currentBalance;

    // Store the current date in local storage
    localStorage.setItem('lastClickedDate', currentDate);

    // Update the balance in the database (assuming you have a function for this)
    updateUserBalance(currentBalance)
        .then(() => {
            // If the balance is updated successfully, notify the user
            alert('Credits added successfully!');
        })
        .catch((error) => {
            console.error('Failed to update balance:', error);
            alert('Failed to add credits. Please try again later.');
        });
});

async function addCreditsToUser(creditsToAdd) {
    try {
        const user = auth.currentUser;
        if (user) {
            const userId = user.uid;
            const userRef = ref(database, 'users/' + userId);
            const snapshot = await get(userRef);
            if (snapshot.exists() && snapshot.val().balance !== undefined) {
                const currentBalance = snapshot.val().balance;
                const newBalance = currentBalance + creditsToAdd;
                await set(ref(database, `users/${userId}/balance`), newBalance);
                console.log("Credits added successfully.");
                fetchAndUpdateBalance(); // Update the displayed balance
            } else {
                console.error("Balance not found.");
            }
        } else {
            console.log("No user signed in.");
        }
    } catch (error) {
        console.error("Failed to add credits:", error);
    }
}

export { auth, database, ref, set, get, push, storeBetDetails, getCurrentUserBalance, updateUserBalance,showModal, closeModal, registerNewUser};