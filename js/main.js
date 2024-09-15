let inputForm = document.getElementById("inputForm");
let floorInput = document.getElementById("floorInput");
let liftInput = document.getElementById("liftInput");

let liftNo;
let floorNo;

let lifts = [];
let liftRequests = [];

floorInput.addEventListener("input", (e) => {
	let val = e.target.value;

	if (val <= 0) {
		e.target.value = "";
	}
});

liftInput.addEventListener("input", (e) => {
	let val = e.target.value;

	if (val <= 0) {
		e.target.value = "";
	}
});

inputForm.addEventListener("submit", (e) => {
	e.preventDefault();

	liftNo = parseInt(liftInput.value);
	floorNo = parseInt(floorInput.value);

	if (!liftNo && !floorNo) {
		alert("Invalid inputs!");
		return;
	}

	if (!liftNo) {
		alert("Lift no. is required!");
		return;
	}

	if (!floorNo) {
		alert("Floor no. is required!");
		return;
	}

	createFloorsAndLifts();
});

function createFloorsAndLifts() {
	let simulationContainer = document.getElementById("simulationContainer");
	let buildingContainer = document.getElementById("buildingContainer");
	let liftShaftsContainer = document.getElementById("liftShaftsContainer");
	simulationContainer.innerHTML = "";
	buildingContainer.innerHTML = "";
	liftShaftsContainer.innerHTML = "";

	let building = document.createElement("div");
	building.className = "building";
	building.style.height = 125 * floorNo + "px";

	simulationContainer.style.height = 125 * floorNo + "px";

	lifts = [];
	liftRequests = [];

	for (let i = 0; i < floorNo; i++) {
		let floorInfo = document.createElement("div");
		floorInfo.className = `floor-info floor-${i + 1}`;

		let label = document.createElement("label");
		label.className = `floor-label-${i + 1}`;
		label.innerHTML = "Floor " + (i + 1);

		let upBtn = document.createElement("button");
		upBtn.className = "up-btn";
		upBtn.textContent = "▲";
		upBtn.addEventListener("click", () => requestLift(i + 1, "up"));

		let downBtn = document.createElement("button");
		downBtn.className = "down-btn";
		downBtn.textContent = "▼";
		downBtn.addEventListener("click", () => requestLift(i + 1, "down"));

		let liftBtns = document.createElement("div");
		liftBtns.className = "lift-btns";

		floorInfo.append(label);

		if (i == 0) {
			liftBtns.append(upBtn);
		} else if (i == floorNo - 1) {
			liftBtns.append(downBtn);
		} else {
			liftBtns.append(upBtn, downBtn);
		}
		floorInfo.appendChild(liftBtns);
		building.appendChild(floorInfo);
	}
	buildingContainer.appendChild(building);

	for (let j = 0; j < liftNo; j++) {
		let upIndicator = document.createElement("div");
		upIndicator.className = "up-indicator";
		upIndicator.innerHTML = "ᐃ";

		let downIndicator = document.createElement("div");
		downIndicator.className = "down-indicator";
		downIndicator.innerHTML = "ᐁ";

		let liftLabel = document.createElement("div");
		liftLabel.innerHTML = ` L${j + 1}`;

		let liftInfo = document.createElement("div");
		liftInfo.className = "lift-info";

		liftInfo.append(downIndicator, liftLabel, upIndicator);

		let liftShaft = document.createElement("div");
		liftShaft.className = "lift-shaft";
		liftShaft.style.height = 125 * floorNo + "px";

		let lift = document.createElement("div");
		lift.className = "lift";
		lift.id = `lift-${j}`;

		let liftDoors = document.createElement("div");
		liftDoors.className = "lift-doors";

		let leftDoor = document.createElement("div");
		leftDoor.className = "left-door";

		let rightDoor = document.createElement("div");
		rightDoor.className = "right-door";

		liftDoors.append(leftDoor, rightDoor);
		lift.append(liftInfo, liftDoors);
		liftShaft.appendChild(lift);
		liftShaftsContainer.appendChild(liftShaft);
		lifts.push({
			id: j + 1,
			element: lift,
			currentFloor: 1,
			isMoving: false,
			destinationFloor: null,
			direction: null,
		});
	}
	simulationContainer.append(buildingContainer, liftShaftsContainer);
}

function requestLift(floorNum, direction) {
	const existingRequest = lifts.find(
		(req) => req.destinationFloor === floorNum && req.direction === direction,
	);
	if (!existingRequest) {
		liftRequests.push({ floor: floorNum, direction });
		processLiftRequests();
	} else {
		return;
	}

	let floorElement = document.querySelector(`.floor-${floorNum}`);

	if (floorElement) {
		const button = floorElement.querySelector(`.${direction}-btn`);

		if (button) {
			button.classList.add("alerts-border");
		}
	}
}

function processLiftRequests() {
	if (liftRequests.length === 0) {
		return;
	}

	const request = liftRequests[0];

	const availableLift = findNearestIdleLift(request.floor);

	if (availableLift) {
		liftRequests.shift();
		moveLift(availableLift, request.floor, request.direction);
	} else {
	}
}

function findNearestIdleLift(targetFloor) {
	let nearestLift = null;
	let minDistance = Infinity;

	for (let lift of lifts) {
		if (!lift.isMoving) {
			const distance = Math.abs(targetFloor - lift.currentFloor);
			if (distance < minDistance) {
				minDistance = distance;
				nearestLift = lift;
			}
		}
	}

	return nearestLift;
}

function moveLift(lift, targetFloor, direction) {
	lift.isMoving = true;
	lift.destinationFloor = targetFloor;
	lift.direction = direction;
	const floorHeight = 125;
	const distance = Math.abs(targetFloor - lift.currentFloor);
	// const duration = distance <= 10 ? distance * 2000 : distance <= 20 ? distance * 1500 : distance <= 30 ? distance *1000 : distance <= 40 ? distance * 500 : distance * 250; // Convert to milliseconds
	const duration = distance * 2000;

	let etaInterval;

	let floorLabel = document.querySelector(`.floor-label-${targetFloor}`);
	if (lift.currentFloor !== targetFloor) {
		let eta = duration;
		let etaInfo = floorLabel.querySelector(`.eta-info-lift-${lift.id}`);
		if (!etaInfo) {
			etaInfo = document.createElement("div");
			etaInfo.className = `eta-info-lift-${lift.id}`;
			floorLabel.appendChild(etaInfo);
		}
		etaInfo.innerHTML = `Lift ${lift.id} Approaching`;
		etaInterval = setInterval(() => {
			eta = eta - 100;
			etaInfo.innerHTML = `Lift ${lift.id} ETA: ${(eta / 1000).toFixed(1)}s`;
		}, 100);
	}

	if (lift.currentFloor !== targetFloor) {
		const movingDirection =
			lift.currentFloor < lift.destinationFloor ? "up" : "down";
		const indicator = lift.element.querySelector(
			`.${movingDirection}-indicator`,
		);
		indicator.classList.add("indicator-blink");
	}

	lift.element.style.transitionDuration = `${duration}ms`;
	lift.element.style.transform = `translateY(-${(targetFloor - 1) * floorHeight}px)`;

	setTimeout(() => {
		const movingDirection =
			lift.currentFloor < lift.destinationFloor ? "up" : "down";
		const indicator = lift.element.querySelector(
			`.${movingDirection}-indicator`,
		);
		indicator.classList.remove("indicator-blink");
		let floorElement = document.querySelector(`.floor-${targetFloor}`);
		if (floorElement) {
			const button = floorElement.querySelector(`.${direction}-btn`);
			if (button) {
				button.classList.remove("alerts-border");
			}

			floorLabel.innerHTML = `Floor ${targetFloor}`;
			clearInterval(etaInterval);
		}
		operateLiftDoors(lift, targetFloor);
	}, duration);
}

function operateLiftDoors(lift, targetFloor) {
	const leftDoor = lift.element.querySelector(".left-door");
	const rightDoor = lift.element.querySelector(".right-door");

	// Open doors
	leftDoor.style.transform = "translateX(-100%)";
	rightDoor.style.transform = "translateX(100%)";

	setTimeout(() => {
		// Close doors after 2.5 seconds
		leftDoor.style.transform = "translateX(0)";
		rightDoor.style.transform = "translateX(0)";

		// Complete the lift operation
		setTimeout(() => {
			lift.currentFloor = targetFloor;
			lift.isMoving = false;
			lift.destinationFloor = null;
			lift.direction = null;

			// Process the next request
			processLiftRequests();
		}, 2500);
	}, 2500);
}
