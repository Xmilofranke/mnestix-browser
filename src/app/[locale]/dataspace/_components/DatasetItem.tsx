import { AssetItem } from 'app/[locale]/dataspace/_components/AssetItem';

type DatasetItemProps = {
    dataset: any[];
    providerId: string;
    endpoint: string;
};

export function DatasetItem(props: DatasetItemProps) {
    return (
        <>
            {Array.isArray(props.dataset) ? (
                <>
                    {props.dataset.map(async (asset) => {
                        return (
                            <AssetItem
                                asset={asset}
                                providerId={props.providerId}
                                endpoint={props.endpoint}
                                key={asset['@id']}
                            />
                        );
                    })}
                </>
            ) : (
                <AssetItem
                    asset={props.dataset}
                    providerId={props.providerId}
                    endpoint={props.endpoint}
                />
            )}
        </>
    );
}
