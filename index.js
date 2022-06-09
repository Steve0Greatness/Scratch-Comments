const express = require("express"),
	app = express(),
	fetch = (...args) =>
		import("node-fetch").then(({ default: fetch }) => fetch(...args)),
	parser = require("xml2js").parseString,
	dom = require("jsdom");

app.get("/", (_, res) => {
	res.sendFile(__dirname + "/docs.html");
})

function getContent(res, place, target) {
	fetch(`https://scratch.mit.edu/site-api/comments/${place}/${target}/?limit=10`)
		.then(e => e.text())
		.then(e => {
			let document = (new dom.JSDOM(e)).window.document,
				list_elements = document.getElementsByTagName("li"),
				comments = [];
			for (let i = 0; i < list_elements.length; i++) {
				let li = list_elements[i],
					comment = {
						author: li.querySelector(".comment > .info > .name > a").innerHTML.replace(/\/n/g, "").replace(/\/t/g, ""),
						content: li.querySelector(".comment > .info > .content").innerHTML.replace(/\/n/g, "").replace(/\/t/g, ""),
						posted: new Date(li.querySelector("div > .time").getAttribute("title")),
						reply: li.classList.contains("reply"),
					}
				comments.push(comment)
			}
			res.send(comments);
		})
}

app.get("/users/:user", (req, res) => {
	getContent(res, "user", req.params.user);
})

app.get("/studios/:studio", (req, res) => {
	getContent(res, "gallery", req.params.studio);
})

app.listen(8080, () => {
	console.log("Running.")
})