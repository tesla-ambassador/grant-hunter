const queue: string[] = []

// Function to add
function add(item: string) {
    queue.push(item);
}

function remove() {
    return queue.splice(0, 1)
}

async function runner() {
    while(true) {
      if (queue.length !== 0) {
        const removedItem = remove();
        console.log(removedItem);
      } else {
        await new Promise((resolve) => {
            setTimeout(resolve, 100)
        })
      }
    }
}

runner();

add("Luffy");
add("Naruto");
add("Batman");
