document.addEventListener("DOMContentLoaded", () => {
    const app = firebase.app();
    const db = firebase.firestore();

    const loginBtn = document.querySelector(".feature__test .login__btn");
    const logoutBtn = document.querySelector(".feature__test .signout__btn");
    const userImg = document.querySelector(".user__img");
    const fetchPostsBtn = document.querySelector(".fetchposts__btn");
    const postsDiv = document.getElementById("posts");

    const googleLogin = () => {
        // https://firebase.google.com/docs/auth/web/google-signin
        const provider = new firebase.auth.GoogleAuthProvider();

        // Note - signInWithRedirect() can also be used and this redirects to another page to complete the sign-in process.
        firebase.auth().signInWithPopup(provider)
            .then(result => {
                console.log(result.user);
                document.querySelector(".feature__test p").innerText = `Welcome ${result.user.displayName}`;
                userImg.src = result.user.photoURL;
                userImg.style.display = "block";
                loginBtn.style.display = "none";
                logoutBtn.style.display = "block";
            })
            .catch(err => {
                console.error(err);
                console.log(err.code)
                document.querySelector(".feature__test p").innerText = `An error occurred - ${err.message}`
            })
    }

    const firebaseLogout = () => {
        // Signing out a logged in user
        firebase.auth().signOut()
            .then(result => {
                console.log(result);
                document.querySelector(".feature__test p").innerText = `Successfully signed out.`;
                loginBtn.style.display = "block";
                logoutBtn.style.display = "none";
                userImg.style.display = "none";
            })
            .catch(err => {
                console.error(err);
            })
    }

    loginBtn.addEventListener("click", () => {
        googleLogin();
    })

    logoutBtn.addEventListener("click", ()=> {
        firebaseLogout();
    })

    const fetchPosts = () => {
        const posts = db.collection("posts");
        posts.get()
            .then(result => {
                console.log(true)
                result.forEach(doc => {
                    console.log(doc.id)
                    console.log(doc.data())
                    const post = doc.data();

                    const postDiv = document.createElement("div");
                    const postTitle = document.createElement("h3")
                    postDiv.id = "post__card"
                    postDiv.innerHTML = `
                        <h3>Title :- ${post.title}</h3>
                        <small>${post.timestamp.toDate().toDateString()}</small>
                        <p>${post.content}</p>
                    `

                    postsDiv.append(postDiv);
                })
            })
            .catch(err => {
                console.error(err)
            })
    }

    const fetchPostsByFeatured = () => {
        // Writing conditional queries with where clause 
        const posts = db.collection("posts").where("featured", "==", true);
        posts.get()
            .then(result => {
                result.forEach(doc => {
                    console.log(doc.data())
                })
            })
            .catch(err => {
                console.error(err)
            })
    }

    const fetchPostRealtime = () => {
        const doc = db.collection("posts").where("featured", "==", true);
        doc.onSnapshot(result => {
            result.forEach(post => {
                console.log(post.data())
            })
        })
    }

    const fetchProducts = () => {
        const productRef = db.collection("products");
        const query = productRef.orderBy("price", "desc").limit(2);

        query.get() 
            .then( result => {
                result.forEach(product => {
                    console.log(product.data())
                })
        })
    }

    fetchProducts()
    fetchPostRealtime()


    fetchPostsBtn.addEventListener("click", () => {
        fetchPosts()
        fetchPostsByFeatured()
    })

    const form = document.querySelector("form");
    form.addEventListener("submit", (e) => {
        let data = {}
        e.preventDefault();
        const formData = new FormData(e.target);
        for (let pair of formData.entries()){
            // console.log(pair[0], pair[1])
            data[pair[0]] = pair[1]
        }
        data.featured = data.featured == "yes" ? true : false;
        data.timestamp = firebase.firestore.FieldValue.serverTimestamp();
        console.log(data);

        db.collection("posts")
            .add(data)
            .then(result => {
                alert("Successfully added post.")
            })
            .catch(err => {
                console.error(err);
            })
    })

    document.getElementById("file").addEventListener("change", (e) => {
        console.log(e.target.files[0])
        console.log(e.target.files[0].name)
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(e.target.files[0].name);

        const task = fileRef.put(e.target.files[0])

        task.then(snapshot => {
            console.log(snapshot)
            snapshot.ref.getDownloadURL()
            .then(downloadURL => {
                console.log(downloadURL)
            })

        })
    })

})

