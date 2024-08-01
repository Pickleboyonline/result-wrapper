import { createAsyncResultWrapper } from "./mod.ts";
import { assertEquals } from "jsr:@std/assert@1";

Deno.test("async result test", async () => {
    const wrapAsync = createAsyncResultWrapper({
        shouldAwaitOnErrorFunction: false,
    });

    const [_, err] = await wrapAsync(async () => {
        throw new Error("Hello World!");
    }, {
        expect: "hello world test",
    });

    if (!err) {
        throw new Error("Did not properly catch error!")
    }

    const msg = err.message
    const originalErr = err.cause as Error

    assertEquals(msg, "hello world test")
    assertEquals(originalErr.message, "Hello World!")
});
