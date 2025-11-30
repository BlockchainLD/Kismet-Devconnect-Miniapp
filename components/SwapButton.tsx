import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useFarcaster } from '../contexts/FarcasterContext';
import { Artist, ThemeConfig } from '../types';
import { sdk } from '@farcaster/miniapp-sdk';

interface SwapButtonProps {
  artist: Artist;
  theme: ThemeConfig;
  className?: string;
}

// Helper to extract token address from Uniswap URL
const extractTokenAddress = (url?: string): string | null => {
  if (!url) return null;
  const match = url.match(/\/base\/(0x[a-fA-F0-9]{40})/);
  return match ? match[1] : null;
};

// Convert token address to CAIP-19 format for Farcaster SDK
// Base chain ID is 8453
const toCAIP19 = (tokenAddress: string, isNative: boolean = false): string => {
  if (isNative) {
    return 'eip155:8453/native'; // Base ETH
  }
  return `eip155:8453/erc20:${tokenAddress}`;
};

export const SwapButton: React.FC<SwapButtonProps> = ({ artist, theme, className = '' }) => {
  const { isContextLoaded } = useFarcaster();
  const [isSwapping, setIsSwapping] = useState(false);
  const tokenAddress = artist.creatorCoinAddress || extractTokenAddress(artist.creatorCoinLink);
  const isInMiniapp = isContextLoaded; // If Farcaster context is loaded, we're in miniapp

  const handleSwap = async () => {
    if (!tokenAddress) {
      // Fallback to explore link if no token address
      if (artist.creatorCoinLink) {
        window.open(artist.creatorCoinLink, '_blank');
      }
      return;
    }

    // Check if we're in miniapp and SDK is available
    console.log('Swap button clicked:', {
      isInMiniapp,
      hasSDK: !!sdk,
      hasActions: !!sdk?.actions,
      hasSwapToken: !!sdk?.actions?.swapToken,
      tokenAddress,
      artist: artist.name
    });

    if (!isInMiniapp) {
      console.log('Not in miniapp context, opening Uniswap URL');
      const swapUrl = `https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=${tokenAddress}&chain=base`;
      window.open(swapUrl, '_blank');
      return;
    }

    if (!sdk?.actions?.swapToken) {
      console.warn('SDK swapToken not available, falling back to Uniswap URL');
      const swapUrl = `https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=${tokenAddress}&chain=base`;
      window.open(swapUrl, '_blank');
      return;
    }

    setIsSwapping(true);
    try {
      // Use Farcaster native swap modal
      // Selling ETH (native) to buy the creator coin token
      const buyTokenCAIP19 = toCAIP19(tokenAddress);
      console.log(`Initiating native swap for ${artist.name}:`, {
        sellToken: 'eip155:8453/native',
        buyToken: buyTokenCAIP19,
        tokenAddress: tokenAddress
      });
      
      const result = await sdk.actions.swapToken({
        sellToken: 'eip155:8453/native', // Base ETH
        buyToken: buyTokenCAIP19, // Creator coin token - correctly mapped to artist
        // sellAmount is optional - if not provided, user can enter amount in modal
      });

      console.log('Swap result:', result);

      if (result.success) {
        console.log('Swap initiated successfully:', result.swap);
        // Swap modal should be open, no need to do anything else
      } else {
        console.error('Swap failed:', result.reason, result.error);
        // If user rejected, don't open Uniswap
        if (result.reason === 'rejected_by_user') {
          console.log('User rejected swap');
          return;
        }
        // Fallback to Uniswap on other errors
        const swapUrl = `https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=${tokenAddress}&chain=base`;
        window.open(swapUrl, '_blank');
      }
    } catch (error) {
      console.error('Error initiating swap:', error);
      // Fallback to Uniswap on error
      const swapUrl = `https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=${tokenAddress}&chain=base`;
      window.open(swapUrl, '_blank');
    } finally {
      setIsSwapping(false);
    }
  };

  // If not in miniapp context, show regular Uniswap explore link (web experience)
  if (!isInMiniapp || !tokenAddress) {
    return (
      <a 
        href={artist.creatorCoinLink}
        target="_blank"
        rel="noreferrer"
        className={`px-6 py-3 rounded-full flex items-center gap-3 font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${theme.buttonClass} ${theme.id === 'sato' ? 'border-b-2 border-stone-400 rounded-none px-0 hover:bg-transparent' : ''} ${theme.id === 'noistruct' ? 'bg-white/80 backdrop-blur' : ''} ${className}`}
      >
        <Sparkles size={18} />
        <span>Buy Creator Coin</span>
      </a>
    );
  }

  // In miniapp context, show swap button that opens native Farcaster swap modal
  return (
    <button
      onClick={handleSwap}
      disabled={isSwapping}
      className={`px-6 py-3 rounded-full flex items-center gap-3 font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${theme.buttonClass} ${theme.id === 'sato' ? 'border-b-2 border-stone-400 rounded-none px-0 hover:bg-transparent' : ''} ${theme.id === 'noistruct' ? 'bg-white/80 backdrop-blur' : ''} ${className}`}
    >
      {isSwapping ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          <span>Opening Swap...</span>
        </>
      ) : (
        <>
          <Sparkles size={18} />
          <span>Swap Creator Coin</span>
        </>
      )}
    </button>
  );
};

