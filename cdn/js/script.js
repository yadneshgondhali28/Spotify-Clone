console.log("let's  write Javascript");

let currentSong = new Audio();
let songs;
let current_Folder;

// function to fetch songs
async function getSongs(folder) {
  current_Folder = folder;
  let a = await fetch(`/cdn/${folder}`);
  let convertToTextFormat = await a.text();

  let div = document.createElement('div');
  div.innerHTML = convertToTextFormat;
  let as = div.getElementsByTagName('a');

  songs = [];
  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith('.mp3')) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // Show all the songs in the playlist
  let songList = document.querySelector(".songs-list").getElementsByTagName("ul")[0];
  songList.innerHTML = "";
  for (const song of songs) {
    songList.innerHTML = songList.innerHTML + `<li class="flex items-align rounded">
        <div class="music-icon">
          <img class="invert" src="cdn/icons/music-icon.svg" alt="music icon">
        </div>
        <div class="song-info">
          <div class="song-name">${song.replaceAll("%20", " ")}</div>
          <!-- <div class="artist-name">artist</div> -->
        </div>
        <div class="play-now">
          <img class="invert cursor-pointer" src="cdn/icons/playbar-play-icon.svg" alt="play now icon">
        </div>
      </li>`;
  }

  // Attach an event listener to each song
  Array.from(document.querySelector(".songs-list").getElementsByTagName("li")).forEach(e => {
    e.children[2].addEventListener("click", () => {
      playMusic(e.querySelector(".song-info").firstElementChild.innerHTML)
    });
  });

  
  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/cdn/${current_Folder}/` + track
  if (!pause) {
    currentSong.play().then(function () {
      console.log("Audio is playing");
    }).catch(function (error) {
      console.error(error);
    });
    play.src = "cdn/icons/pause-icon.svg";
  }
  document.querySelector(".play-bar-song-info").innerHTML = track;
  document.querySelector(".song-duration").innerHTML = "00:00/00:00";
}

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

// Creating function displayAlbums(){}
async function displayAlbums() {
  let a = await fetch(`/cdn/songs`);
  let response = await a.text();
  let div = document.createElement('div');
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".card-container");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/")) {
      let folder = e.href.split("/").slice(-2)[0];

      // Get the metadata of the folder
      let a = await fetch(`/cdn/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);
      cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder=${folder} class="card rounded">
        <img
          class="rounded"
          src="cdn/songs/${folder}/cover.jpg"
          alt="song category 01"
        />
        <h2>${response.title}</h2>
        <div class="card-para">
          <p>${response.description}</p>
        </div>
        <div class="play-btn flex items-align justify-content">
          <img src="cdn/icons/play-icon.svg" alt="play icon" />
        </div>
      </div>`
    }
  }

  // Load the playlist whenever card is clicked!
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0], true);
    });
  });

}

async function main() {
  // Get the list of all the songs
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  // Display all the albums on the page
  displayAlbums();

  // Attach an event listener to play button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "cdn/icons/pause-icon.svg";
    } else {
      currentSong.pause();
      play.src = "cdn/icons/playbar-play-icon.svg"
    }
  })

  // listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-duration").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  })

  // Adding an event listener in seekbar
  document.querySelector(".seek-bar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100;
  })

  // Add event listener to hamburger icon
  let hamIcon = document.getElementById("ham-icon");
  let leftSection = document.querySelector(".left-section");
  let crossIcon = document.querySelector(".close-left-section").firstElementChild

  hamIcon.addEventListener("click", () => {
    leftSection.style.left = "0";
  })

  crossIcon.addEventListener("click", () => {
    leftSection.style.left = "-120%";
  })

  // Add event listener to previous button
  previous.addEventListener("click", () => {
    console.log("previous btn clicked!");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1]);
    }
  })

  // Add event listener to next button
  next.addEventListener("click", () => {
    console.log("next btn clicked!");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1]);
    }
  })

  // Add event listener to volume
  let volumeSeekbar = document.querySelector(".vol-range").getElementsByTagName("input")[0];
  volumeSeekbar.addEventListener("change", (e) => {
    console.log("setting volume to ", e.target.value, "/100");
    currentSong.volume = parseInt(e.target.value) / 100;
  })

  // Add event listener to the volume btn to mute
  let img = document.querySelector(".volume").firstElementChild
  img.addEventListener("click", (e) => {
    if (e.target.src.includes("volume-icon.svg")) {
      e.target.src = e.target.src.replace("volume-icon.svg", "volume-mute-icon.svg");
      currentSong.volume = "0.0";
      volumeSeekbar.value = "0";
    }
    else {
      e.target.src = "cdn/icons/volume-icon.svg";
      currentSong.volume = "0.10";
      volumeSeekbar.value = "10";
    }
  })

  document.addEventListener("contextmenu", (e)=>{
    e.preventDefault();
  });

}

main();