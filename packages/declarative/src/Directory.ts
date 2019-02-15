import {
  useEffect,
  Provider,
  useState,
  usePrevious,
  useContext
} from "@deaven/react-atoms.core";
import { mkdirSync, rmdirSync } from "fs";
import React from "react";
import { moveSync } from "fs-extra";
import { join } from "path";

export const DirectoryContext = React.createContext(".");

export const Directory = (props: { name: string; children: JSX.Element }) =>
  useState(false)
    .compose(() => usePrevious(props.name))
    .compose(() => useContext(DirectoryContext))
    .compose((mounted, _setMounted, ref, parentDirectory) =>
      useEffect(() => {
        if (mounted) {
          console.log(
            "moving",
            join(parentDirectory, ref.current),
            join(parentDirectory, props.name)
          );
          moveSync(
            join(parentDirectory, ref.current),
            join(parentDirectory, props.name)
          );
        }
      }, [props.name])
    )
    .compose((_mounted, setMounted, _ref, parentDirectory) =>
      useEffect(() => {
        console.log("creating", join(parentDirectory, props.name));
        mkdirSync(join(parentDirectory, props.name), { recursive: true });
        setMounted(true);
        return () => {
          console.log("deleting", join(parentDirectory, props.name));
          rmdirSync(join(parentDirectory, props.name));
        };
      }, [])
    )
    .render((mounted, _setMounted, _ref, parentDirectory) =>
      mounted
        ? Provider(DirectoryContext)({
            value: join(parentDirectory, props.name),
            children: props.children
          })
        : ((null as unknown) as JSX.Element)
    );
