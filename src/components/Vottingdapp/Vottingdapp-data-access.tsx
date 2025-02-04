'use client'

import { getVottingdappProgram, getVottingdappProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useVottingdappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getVottingdappProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getVottingdappProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['Vottingdapp', 'all', { cluster }],
    queryFn: () => program.account.Vottingdapp.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['Vottingdapp', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ Vottingdapp: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useVottingdappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useVottingdappProgram()

  const accountQuery = useQuery({
    queryKey: ['Vottingdapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.Vottingdapp.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['Vottingdapp', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ Vottingdapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['Vottingdapp', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ Vottingdapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['Vottingdapp', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ Vottingdapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['Vottingdapp', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ Vottingdapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
