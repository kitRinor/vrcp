import { downloadImageToCache } from "@/contexts/CacheContext";
import { useEffect, useState } from "react";
import EnhancedImageViewing from "react-native-image-viewing";

interface Props {
  imageUrl: string[]; // array of image URLs
  initialIdx?: number; // initial index to show
  open: boolean;
  onClose: () => void;
}
/**
 * fullscreen preview of images
 * @returns 
 */
const ImagePreview = ({
  imageUrl,
  initialIdx = 0,
  open,
  onClose,
}: Props) => {
  const [images, setImages] = useState<{ uri: string }[]>(imageUrl.map((uri) => ({ uri })));

  useEffect(() => {
    if (!open) return;
    setImages(imageUrl.map((uri) => ({ uri })));
    if (initialIdx >= 0 && initialIdx < imageUrl.length) {
      // download initial image to cache
      downloadImageToCache(imageUrl[initialIdx]).then((localUri) => {
        if (!localUri) return;
        setImages((prev) => {
          const newImages = [...prev];
          newImages[initialIdx] = { uri: localUri };
          return newImages;
        });
      }).catch((e) => {
        console.error("Error downloading image for preview:", e);
      });
    }
  }, [imageUrl, initialIdx, open]);

  const onImageIndexChange = (index: number) => {
    if (index < 0 || index >= images.length) return;
    if (images[index].uri.startsWith("file://")) return; // already local
    // download to cache
    downloadImageToCache(images[index].uri).then((localUri) => {
      if (!localUri) return;
      setImages((prev) => {
        const newImages = [...prev];
        newImages[index] = { uri: localUri };
        return newImages;
      });
    }).catch((e) => {
      console.error("Error downloading image for preview:", e);
    });
  };

  return (
    <EnhancedImageViewing
      images={images}
      imageIndex={initialIdx}
      onImageIndexChange={onImageIndexChange}
      // swipeToCloseEnabled={false}
      visible={open}
      onRequestClose={onClose}
    />
  )
};

export default ImagePreview;
