"use client";

import Image from "next/image";
import { usePara } from "@/components/ParaProvider";
import { useState } from "react";
import { createWalletClient, http, custom, encodeFunctionData, keccak256, toBytes, parseAbi, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected, openModal, account, walletClient } = usePara();

  async function mintWithSignature() {
    try {
      const contractAddress = "0x2d5fB2A0ec22A89145aB9FC783df6288f2adc993";
      const chainId = 123420001114;
      const rpcUrl = "https://rpc.basecamp.t.raas.gelato.cloud/ec38c9fffbfd4ed5ac3069d1eef0e84f";

      const abi = parseAbi([
        "function mintWithSignature((address to,address royaltyRecipient,uint256 royaltyBps,address primarySaleRecipient,uint256 tokenId,string uri,uint256 quantity,uint256 pricePerToken,address currency,uint128 validityStartTimestamp,uint128 validityEndTimestamp,bytes32 uid) req, bytes signature) payable"
      ]);

      const minterAccount = privateKeyToAccount(process.env.NEXT_PUBLIC_PRIVATE_KEY as `0x${string}`);

      const userClient = createWalletClient({
        account: minterAccount?.address,
        chain: { id: chainId, name: "basecamp", nativeCurrency: { name: "CAMP", symbol: "CAMP", decimals: 18 }, rpcUrls: { default: { http: [rpcUrl] } } },
        transport: http(rpcUrl),
      });

      const now = Math.floor(Date.now() / 1000);

      if (!account?.address || !walletClient) {
        console.error("Account or wallet client not available");
        return;
      }

      const userAddress = account.address;

      const mintRequest = {
        to: account.address,
        royaltyRecipient: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        royaltyBps: BigInt(0),
        primarySaleRecipient: "0x0000000000000000000000000000000000000000" as `0x${string}`,
        tokenId: BigInt(0),
        uri: "ipfs://QmZ6tafpm1kUBMeAkpYd8eEokfHcxyYstE8KNq2vnhrCtk/0",
        quantity: BigInt(1),
        pricePerToken: BigInt(0),
        currency: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" as `0x${string}`,
        validityStartTimestamp: BigInt(now - 60),
        validityEndTimestamp: BigInt(now + 86400),
        uid: keccak256(toBytes("unique-id")),
      };

      const domain = {
        name: "TokenERC1155",
        version: "1",
        chainId,
        verifyingContract: contractAddress as `0x${string}`,
      };

      const types = {
        MintRequest: [
          { name: "to", type: "address" },
          { name: "royaltyRecipient", type: "address" },
          { name: "royaltyBps", type: "uint256" },
          { name: "primarySaleRecipient", type: "address" },
          { name: "tokenId", type: "uint256" },
          { name: "uri", type: "string" },
          { name: "quantity", type: "uint256" },
          { name: "pricePerToken", type: "uint256" },
          { name: "currency", type: "address" },
          { name: "validityStartTimestamp", type: "uint128" },
          { name: "validityEndTimestamp", type: "uint128" },
          { name: "uid", type: "bytes32" },
        ],
      };

      const signature = await walletClient.signTypedData({
        account: account,
        domain,
        types,
        primaryType: "MintRequest",
        message: mintRequest,
      });

      const txHash = await userClient.writeContract({
        address: contractAddress,
        abi,
        functionName: "mintWithSignature",
        args: [mintRequest, signature],
        account: minterAccount,
      });

      console.log('txHash', txHash)
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {/* Fox Image - Clickable and Centered */}
        <div className="flex justify-center items-center mb-4">
          <Image
            src="/fox.png"
            alt="Fox"
            width={200}
            height={200}
            className="cursor-pointer hover:scale-105 transition-transform duration-200 rounded-lg shadow-lg"
            onClick={() => setIsModalOpen(true)}
          />
        </div>

        {/* Connect Button */}
        <div className="flex justify-center items-center w-full">
          <button 
            onClick={() => {
              if (isConnected) {
                mintWithSignature();
                        // console.log("connected");
                        // openModal();
              } else {
                openModal();
            }}
          }
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg">
            
            {isConnected ? "Claim" : "Connect"}
          </button>
        </div>

      </main>

      {/* Modal for enlarged fox image */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src="/fox.png"
              alt="Fox - Enlarged"
              width={800}
              height={800}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 text-white text-2xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75 transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
