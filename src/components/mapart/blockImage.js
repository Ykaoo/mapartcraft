import React, { Component } from "react";
import { blockExceptions } from "./blockExceptions";
import IMG_Null from "../../images/null.png";
import "./blockImage.css";
const blockImages = require.context('../../images/blocks', false, /\.png$/);

class BlockImage extends Component {
    
    render() {
        const { getLocaleString, coloursJSON, colourSetId, blockId, style, className, ...props_others } = this.props;
        const isNone = blockId === "-1"; // if barrier / no block selected for colourSetId
        const isUnknown = colourSetId === "64" && blockId === "2"; // if unknown / placeholder block
        var blockImage;
        if (!isNone) {
            var block = this.getMostRecentNBTName(coloursJSON[colourSetId].blocks[blockId]);
            blockImage = this.getBlockImage(block);
            console.log("" + blockImage);
        }
        return (
            <img
                src={IMG_Null}
                alt={
                    isNone
                        ? getLocaleString("NONE")
                        : isUnknown
                            ? getLocaleString("MATERIALS/PLACEHOLDER-BLOCK-TT")
                            : coloursJSON[colourSetId].blocks[blockId].displayName
                }
                style={
                    isNone //image for none selection
                        ? {
                            backgroundImage: `url(https://minecraft.wiki/images/BlockSprite_barrier.png)`,
                            backgroundPositionX: "-100%",
                            backgroundPositionY: "-6400%",
                            ...style,
                        }
                        : isUnknown
                            ? {
                                backgroundImage: `url(${blockImage})`,
                                ...style,
                            }
                            : coloursJSON[colourSetId].blocks[blockId].presetIndex === "CUSTOM"
                                ? {
                                    backgroundImage: `url(${blockImage})`,
                                    backgroundColor: `rgb(${coloursJSON[colourSetId].tonesRGB.normal.join(", ")})`,
                                    ...style,
                                }
                                : {
                                    backgroundImage: `url(${blockImage})`,
                                    ...style,
                                }
                }
                className={`blockImage ${className}`}
                {...props_others}
            />
        );
    }

    getBlockImage(block) {
        return blockExceptions[block] ? blockImages(`./${block}.png`).default
        : `https://minecraft.wiki/images/BlockSprite_${block.replace(/_/g, '-')}.png`;
    }

    getMostRecentNBTName(block) {
        const versions = block.validVersions;

        // Convert version strings to arrays of numbers for proper comparison
        const versionKeys = Object.keys(versions).sort((a, b) => {
            const parse = (v) => v.split('.').map(Number);
            const [a1, a2, a3] = parse(a + '.0.0').slice(0, 3);
            const [b1, b2, b3] = parse(b + '.0.0').slice(0, 3);
            return b1 - a1 || b2 - a2 || b3 - a3; // descending
        });

        const resolveVersion = (v) => {
            const visited = new Set();
            while (typeof versions[v] === 'string' && versions[v].startsWith('&')) {
                if (visited.has(v)) break; // Avoid circular references
                visited.add(v);
                v = versions[v].substring(1); // remove '&'
            }
            return versions[v];
        };

        for (const version of versionKeys) {
            const resolved = resolveVersion(version);
            if (resolved && resolved.NBTName) {
                return resolved.NBTName;
            }
        }

        return null; // If not found
    }
}

export default BlockImage;
