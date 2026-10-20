
const form = document.getElementById("progressForm");
const result = document.getElementById("result");
const progressList = document.getElementById("progressList");
const refreshButton = document.getElementById("loadProgress");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const studentName = document
        .getElementById("studentName")
        .value.trim();

    const courseName = document
        .getElementById("courseName")
        .value.trim();

    const completionPercentage = Number(
        document.getElementById("completionPercentage").value
    );

    try {
        result.textContent = "Saving student progress...";

        const response = await fetch("/progress", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                studentName,
                courseName,
                completionPercentage
            })
        });

        const text = await response.text();

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            console.error("Server returned non-JSON response:", text);

            throw new Error(
                `Server error (${response.status}). Check Vercel Runtime Logs.`
            );
        }

        result.textContent = data.message;

        form.reset();

        await loadProgress(false);

    } catch (error) {
        result.textContent = error.message;
        console.error("Error adding progress:", error);
    }
});


async function loadProgress(showRefreshMessage = true) {
    if (refreshButton.disabled) {
        return;
    }

    try {
        refreshButton.disabled = true;
        refreshButton.textContent = "Refreshing...";

        if (showRefreshMessage) {
            result.textContent = "Fetching latest student records...";
        }

        progressList.textContent = "Loading student records...";

        const response = await fetch("/progress", {
            method: "GET",
            cache: "no-store",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                `Failed to load records. Status: ${response.status}`
            );
        }

        const records = await response.json();

        if (!Array.isArray(records)) {
            throw new Error("Invalid response received from the server.");
        }

        progressList.replaceChildren();

        if (records.length === 0) {
            progressList.textContent = "No student records found.";
        } else {
            records.forEach((student) => {
                const card = document.createElement("div");
                card.className = "progress-card";

                const name = document.createElement("h3");
                name.textContent = student.studentName;

                const course = document.createElement("p");
                course.textContent = `Course: ${student.courseName}`;

                const percentage = document.createElement("p");
                percentage.textContent =
                    `Completion: ${student.completionPercentage}%`;

                const bar = document.createElement("div");
                bar.className = "progress-bar";

                const fill = document.createElement("div");
                fill.className = "progress-fill";

                fill.style.width =
                    `${student.completionPercentage}%`;

                bar.appendChild(fill);

                card.append(name, course, percentage, bar);
                progressList.appendChild(card);
            });
        }

        result.textContent =
            `Records refreshed successfully at ${new Date().toLocaleTimeString()
            }`;

    } catch (error) {
        progressList.textContent =
            "Unable to load records. Please try again.";

        result.textContent = error.message;

        console.error("Error refreshing records:", error);

    } finally {
        refreshButton.disabled = false;
        refreshButton.textContent = "Refresh Records";
    }
}


refreshButton.addEventListener("click", () => {
    loadProgress(true);
});


loadProgress(false);