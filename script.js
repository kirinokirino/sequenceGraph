// Analyse button event handling.
document.querySelector('#series button').addEventListener("click", analyse);

// Share button event handling.
document.querySelector('#shareButton').addEventListener("click", share);

// Welcome message hiding.
document.querySelector('#welcome button').addEventListener("click", function () {
	document.querySelector('#welcome').classList.add("hidden");
});

// Get sequence from url query and automatically analyse it.
const urlQuery = decodeURIComponent(window.location.search);
if (urlQuery) {
	// Hide welcome message.
	document.querySelector('#welcome').classList.add("hidden");
	// Parse sequence, copy it into input field and analyse it.
	decoded = parseUrlQuery(urlQuery);
	setSequence(decoded["sequence"]);
	analyse();
}

// Expects query string starting from "?", returns object containing key-value pairs 
function parseUrlQuery(query) {
	const parameterPairs = urlQuery.slice(1).split("&");
	let decoded = {};
	for (pair of parameterPairs) {
		const splitPair = pair.split("=");
		const property = splitPair[0];
		const value = splitPair[1];
		decoded[property] = value;
	}
	return decoded;
}

function share() {
	const sequence = "?sequence=" + encodeURIComponent(getSequence().join());
	const shareUrl = window.location.href.split("?")[0] + sequence;
	const shareElement = document.querySelector('#shareMessage a');
	shareElement.href = shareUrl;
	shareElement.text = shareUrl;
	document.querySelector('#shareMessage').classList.remove("hidden");
}

// Get sequence from input field, build and show table and chart.
function analyse() {
	const data = getSequence();

	createChart(data);
	document.querySelector('#chart').classList.remove("hidden");

	createTable(data);
	document.querySelector('#table').classList.remove("hidden");
}

// Set value of input field.
function setSequence(data) {
	document.querySelector('#series input').value = data;
}

// Get value from input field.
function getSequence() {
	return document.querySelector('#series input').value.split(',').map(Number);
}

// Create chart with provided data and show it on #chart canvas. With the help of Chart.js.
function createChart(data) {
	const canvas = document.querySelector('#chart canvas').getContext('2d');
	var chart = new Chart(canvas, {
		// The type of chart.
		type: 'line',

		// The data for our dataset.
		data: {
			labels: data,
			datasets: [{
				label: 'Unlabeled data',
				backgroundColor: 'rgb(255, 99, 132)',
				borderColor: 'rgb(255, 99, 132)',
				data: data,
				fill: false
			}]
		},

		// Configuration options.
		options: {
			legend: false,
		}
	});
}

// Compute and populate table with the sequence.
// Not sure what kind of general information will be the most useful. 
function createTable(data) {

	const len = data.length;
	const sum = (arr => arr.reduce((a, b) => a + b, 0))(data);
	const mean = sum / len;
	// Delta from the previous data point.
	const changes = data.map(function (value, index, arr) {
		if (index) {
			return value - arr[index - 1];
		} else return 0;
	});
	// Distance of the data point from the mean.
	const deviations = data.map(function (value) {
		return value - mean;
	});

	const min = Math.min(...data);
	const max = Math.max(...data);
	const range = Math.abs(max - min);

	// Analogous to python's zip function.
	const zip = (...rows) => [...rows[0]].map((_, c) => rows.map(row => row[c]));

	const rows = zip(data, changes, deviations);
	const columns = ["Data point", "Delta", "Deviation"];

	// Make a table cell with provided text contents. Possible types are "td" and "th" (string).
	function makeCell(contents, type = 'td') {
		let cell = document.createElement(type);
		cell.appendChild(document.createTextNode(contents));
		return cell;
	}

	// Make a table row from provided array of items. Possible types are "td" and "th" (string).
	function makeRows(items, type = 'td') {
		let row = document.createElement('tr');
		for (item of items) {
			row.appendChild(makeCell(item, type));
		}
		return row;
	}

	// Create and return the table header.
	function createTableHeader(columns) {
		let tableHeder = document.createElement('thead');
		tableHeder.appendChild(makeRows(columns, 'th'));
		return tableHeder;
	}

	// Create and return the table body.
	function createTableBody(rows) {
		let tableBody = document.createElement('tbody');
		rows.forEach(function (rowData) {
			tableBody.appendChild(makeRows(rowData));
		});
		return tableBody;
	}

	// Create and return the table footer.
	function createTableFooter() {
		// TODO
		// const overall = ["Sum", "Mean", "Mean Deviation", "Standard Deviation"];
		// const extremes = ["Min", "Max", "Range"];
		row1 = ["Data points: " + len, "Sum: " + sum, "Mean: " + mean, "Range: " + range];
		footer = document.createElement('tfoot');
		footer.appendChild(makeRows(row1));
		return footer;
	};

	// Select #table element, reset and update it. 
	const table = document.querySelector('#table');
	table.textContent = "";
	table.appendChild(createTableHeader(columns));
	table.appendChild(createTableBody(rows));
	// table.appendChild(createTableFooter());
}