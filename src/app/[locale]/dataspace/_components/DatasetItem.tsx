import { AssetItem } from 'app/[locale]/dataspace/_components/AssetItem';

type DatasetItemProps = {
    dataset: any[];
    providerId: string;
    endpoint: string;
};

export function DatasetItem(props: DatasetItemProps) {
    return (
        <>
            {/*This is necessary because for some reason the dataset of the
            root catalog contains an asset object instead of an array*/}
            {Array.isArray(props.dataset) ? (
                <>
                    {props.dataset
                        .filter((asset) => asset['aas-type'] === 'AssetAdministrationShell')
                        .map((asset) => {
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
                props.dataset['aas-type'] === 'AssetAdministrationShell' && (
                    <AssetItem asset={props.dataset} providerId={props.providerId} endpoint={props.endpoint} />
                )
            )}
        </>
    );
}
