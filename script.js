document.getElementById("saveBtn").addEventListener("click", async () => {
    const response = await fetch("/save", {
        method: "POST"
    });

    const text = await response.text();

    console.log(text); // this prints in the browser console
});