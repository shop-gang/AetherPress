import { render } from "@testing-library/svelte";
import App from "../src/App.svelte";

describe("App.svelte", () => {
  it("renders without crashing", () => {
    const { container } = render(App);
    expect(container).toBeTruthy();
  });

  it("shows minimal UI/UX elements", () => {
    const { getByText } = render(App);
    // Adjust this selector to match your actual UI text
    expect(getByText(/aetherpress|welcome|prompt|counter/i)).toBeTruthy();
  });
});
