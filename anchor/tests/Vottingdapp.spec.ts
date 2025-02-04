import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Vottingdapp} from '../target/types/Vottingdapp'

describe('Vottingdapp', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Vottingdapp as Program<Vottingdapp>

  const VottingdappKeypair = Keypair.generate()

  it('Initialize Vottingdapp', async () => {
    await program.methods
      .initialize()
      .accounts({
        Vottingdapp: VottingdappKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([VottingdappKeypair])
      .rpc()

    const currentCount = await program.account.Vottingdapp.fetch(VottingdappKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Vottingdapp', async () => {
    await program.methods.increment().accounts({ Vottingdapp: VottingdappKeypair.publicKey }).rpc()

    const currentCount = await program.account.Vottingdapp.fetch(VottingdappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Vottingdapp Again', async () => {
    await program.methods.increment().accounts({ Vottingdapp: VottingdappKeypair.publicKey }).rpc()

    const currentCount = await program.account.Vottingdapp.fetch(VottingdappKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Vottingdapp', async () => {
    await program.methods.decrement().accounts({ Vottingdapp: VottingdappKeypair.publicKey }).rpc()

    const currentCount = await program.account.Vottingdapp.fetch(VottingdappKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set Vottingdapp value', async () => {
    await program.methods.set(42).accounts({ Vottingdapp: VottingdappKeypair.publicKey }).rpc()

    const currentCount = await program.account.Vottingdapp.fetch(VottingdappKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the Vottingdapp account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        Vottingdapp: VottingdappKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.Vottingdapp.fetchNullable(VottingdappKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
