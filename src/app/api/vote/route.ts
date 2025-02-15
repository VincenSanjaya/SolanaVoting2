import { publicKey } from "@coral-xyz/anchor/dist/cjs/utils";
import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Voting } from "@/../anchor/target/types/voting";
import { BN, Program } from "@coral-xyz/anchor";

const IDL = require("@/../anchor/target/idl/voting.json");

export const OPTIONS = GET;

export async function GET(request: Request) {
  const actionMetdata: ActionGetResponse = {
    icon: "https://static.wikia.nocookie.net/f1-formula-1/images/1/1e/Mercedes.jpg/revision/latest?cb=20230119001246",
    title: "Vote for your favorite Driver",
    description: "Vote between Lewis Hamilton and George Russell",
    label: "Vote",
    links: {
      actions: [
        {
          label: "Vote for Lewis Hamilton",
          href: "solana://vote?driver=Lewis Hamilton",
          type: "transaction",
        },
        {
          label: "Vote for George Russell",
          href: "solana://vote?driver=George Russell",
          type: "transaction",
        },
      ],
    },
  };
  return Response.json(actionMetdata, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const driver = url.searchParams.get("driver");

  if (driver != "Lewis Hamilton" && driver != "George Russell") {
    return new Response("Invalid driver", { status: 400, headers: ACTIONS_CORS_HEADERS });
  }

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const program: Program<Voting> = new Program(IDL, { connection });
  const body: ActionPostRequest = await request.json();
  let voter;

  try {
    voter = new PublicKey(body.account);
  } catch (error) {
    return new Response("Invalid Account", { status: 400, headers: ACTIONS_CORS_HEADERS });
  }

  const instruction = await program.methods
    .vote(driver, new BN(1))
    .accounts({
      signer: voter,
    })
    .instruction();

  const blockHash = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockHash.blockhash,
    lastValidBlockHeight: blockHash.lastValidBlockHeight,
  }).add(instruction);

  const response = await createPostResponse({
    fields: {
      transaction: transaction,
      type: "transaction",
    },
  });

  return Response.json(response, {headers: ACTIONS_CORS_HEADERS});
}
