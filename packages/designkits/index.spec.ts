import astBundle from "@deaven/ast-bundle.macro";

test("a", () => {
  const expressImplementation = {
    files: [
      {
        name: "index.js",
        contents: astBundle(() => {
          const express = require("express");
          const app = express();
          const port = 3000;

          // @ts-ignore
          const onUserRequestedToAdd = (a, b, showResultToUser) => {
            showResultToUser(a + b);
          };

          // @ts-ignore
          app.get("/add/:a/:b", (req, res) => {
            // @ts-ignore
            onUserRequestedToAdd(req.params.a, req.params.b, result => {
              res.send(result);
            });
          });

          app.listen(port, () => console.log("up"));
        })
      }
    ]
  };

  expect(
    // @ts-ignore
    implement(
      // @ts-ignore
      astBundle(UserImplementation => {
        // @ts-ignore
        UserImplementation.onUserRequestedToAdd((a, b) => {
          UserImplementation.showResultToUser(a + b);
        });
      })
    )
  ).toEqual(expressImplementation);
});
