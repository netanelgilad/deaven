import {
  useEffect,
  useContext,
  useState,
  usePrevious
} from "@deaven/react-atoms.core";
import { writeFileSync, unlinkSync } from "fs";
import { DirectoryContext } from "./Directory";
import { join } from "path";
import { moveSync } from "fs-extra";

export const File = (props: { name: string; contents: string }) =>
  useContext(DirectoryContext)
    .compose(() => useState(false))
    .compose((directoryName, _mounted, setMounted) =>
      useEffect(() => {
        console.log("writing file", join(directoryName, props.name));
        writeFileSync(join(directoryName, props.name), props.contents);
        setMounted(true);

        return () => {
          console.log("deleting file", join(directoryName, props.name));
          unlinkSync(join(directoryName, props.name));
        };
      }, [])
    )
    .compose(() => usePrevious(props.name))
    .compose(directoryName => usePrevious(directoryName))
    .compose((_directoryName, mounted, _setMounted, prevRef, prevDir) =>
      useEffect(() => {
        if (mounted) {
          console.log(
            "moving file",
            join(prevDir.current, prevRef.current),
            join(prevDir.current, props.name)
          );
          moveSync(
            join(prevDir.current, prevRef.current),
            join(prevDir.current, props.name)
          );
        }
      }, [props.name])
    )
    .compose((_directoryName, mounted, _setMounted, prevRef, prevDir) =>
      useEffect(() => {
        if (mounted) {
          console.log("updating file", join(prevDir.current, prevRef.current));
          writeFileSync(join(prevDir.current, prevRef.current), props.contents);
        }
      }, [props.contents])
    )
    .render();
