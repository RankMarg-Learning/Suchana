async function test() {
  try {
    const res = await fetch("data:text/plain,Hello");
    console.log(await res.text());
  } catch (e) {
    console.error(e);
  }
}
test();
