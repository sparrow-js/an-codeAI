import React from "react";
import { Menu } from "antd";
import { ReactComponent as ZhCnSvg } from "@/assets/header/zh_CN.svg";
import { ReactComponent as EnUsSvg } from "@/assets/header/en_US.svg";
import { ReactComponent as LanguageSvg } from "@/assets/header/language.svg";
import classes from "./index.module.less";
import { localeConfig } from "@/config/locale";
import { useLocale } from "@/locales";
import { useRecoilState } from "recoil";
import { userState } from "@/stores/user";
import HeaderDropdown from "../HeaderDropdown";

interface SelectLangProps {
  className?: string;
}

const SelectLang: React.FC<SelectLangProps> = (props) => {
  const { ...restProps } = props;

  const { formatMessage } = useLocale();
  const [user, setUser] = useRecoilState(userState);

  const { locale, settings } = user;
  let className = "";

  const selectLocale = ({ key }: { key: any }) => {
    setUser({ ...user, locale: key });
    localStorage.setItem("locale", key);
  };

  if (
    (settings.navTheme === "dark" && settings.layout === "top") ||
    settings.layout === "mix"
  ) {
    className = `dark`;
  }

  const langList = () => {
    return (
      <Menu onClick={selectLocale}>
        {localeConfig.map((lang) => {
          return (
            <Menu.Item
              style={{ textAlign: "left" }}
              disabled={locale.toLowerCase() === lang.key}
              key={lang.key}
            >
              {lang.icon} {lang.name}
            </Menu.Item>
          );
        })}
      </Menu>
    );
  };
  return (
    <HeaderDropdown
      placement="bottomRight"
      className={classes.action}
      overlay={langList}
    >
      <span id="language-change" className={classes.lang}>
        <LanguageSvg className={`anticon `} />
      </span>
    </HeaderDropdown>
  );
};

export default SelectLang;
