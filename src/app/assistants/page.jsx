"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Navigation from "../components/Navigation";

function Assistants() {
  const [assistantIds, setAssistantIds] = useState([]);

  useEffect(() => {
    axios
      .get(`/api/assistants`)
      .then((res) => res)
      .then(({ data }) => {
        console.log("get Assistant IDs ==>", data);
        return setAssistantIds(data.assistantIds);
      });
  }, [setAssistantIds]);

  return (
    <div>
      <Navigation />
      <h1>List of Assistants</h1>
      {assistantIds.map((assist) => {
        return (
          <ul key={assist.id}>
            <li>
              <Link href={`/assistant/${assist.id}`}>
                <p>Assistant Name: {assist.name}</p>
              </Link>
            </li>
          </ul>
        );
      })}
    </div>
  );
}

export default Assistants;
