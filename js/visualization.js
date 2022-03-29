d3.csv("data/Congressional Trading.csv").then((data) => {
  for (let i = 0; i < 10; i++) {
  console.log(data[i])
}
})
